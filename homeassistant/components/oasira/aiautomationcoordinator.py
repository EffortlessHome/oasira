"""Coordinator for AI Automation Suggester."""

from datetime import datetime
import logging

from homeassistant.components import persistent_notification
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from homeassistant.components.recorder import get_instance
from homeassistant.components.recorder.models import LazyState
from homeassistant.util.dt import parse_datetime

from homeassistant.core import (
    HomeAssistant,
    ServiceCall,
    ServiceResponse,
    SupportsResponse,
    asyncio,  # noqa: F811, PGH003 # type: ignore
    callback,
)

from .const import (
    DEFAULT_MAX_TOKENS,
    DEFAULT_TEMPERATURE,
    DOMAIN,
)

_LOGGER = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are an AI assistant that generates Home Assistant automations
based on the types of new entities discovered in the system. Your goal
is to provide detailed and useful automation suggestions tailored to
the specific types and functions of the entities, avoiding generic recommendations.

For each entity:
1. Understand its function (e.g., sensor, switch, light, climate control).
2. Consider its current state (e.g., 'on', 'off', 'open', 'closed', 'temperature').
3. Suggest automations based on common use cases for similar entities.
4. Avoid generic suggestions. Instead, provide detailed scenarios such as:
   - 'If the front door sensor detects it is open for more than 5 minutes, send a notification.'
   - 'If no motion is detected for 10 minutes, turn off all lights.'
   - 'If the temperature sensor detects a rise above 25°C, turn on the air conditioner.'
5. Consider combining multiple entities to create context-aware automations.
6. Include appropriate conditions and triggers for time of day, presence, or other contextual factors.
7. Format suggestions in clear, implementable steps.
8. When suggesting scenes, include all relevant entities that should be controlled.
9. Consider energy efficiency and user convenience in your suggestions.
10. Include the actual entity IDs in your suggestions so they can be easily implemented.
11. Suggest automations that make sense based on the entity's domain and capabilities.
12. Consider security implications for sensitive automations (like doors or windows)."""


class AIAutomationCoordinator(DataUpdateCoordinator):
    """Class to manage fetching data from AI model."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize."""
        self.hass = hass
        self.previous_entities = {}
        self.last_update = None
        self.SYSTEM_PROMPT = SYSTEM_PROMPT

        # Initialize data
        self.data = {
            "suggestions": "No suggestions yet",
            "last_update": None,
            "entities_processed": [],
            "provider": "oasira",
        }

        # Prevent automatic updates by setting update_interval to None
        self.update_interval = None

        self.session = async_get_clientsession(hass)

        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=self.update_interval,
        )

    async def _async_update_data(self):
        """Fetch data from AI model."""
        try:
            current_time = datetime.now()

            _LOGGER.debug("Starting manual update at %s", current_time)

            self.last_update = current_time

            # Fetch current entities
            _LOGGER.debug("Fetching current entities")
            try:
                current_entities = {}
                for entity_id in self.hass.states.async_entity_ids():
                    state = self.hass.states.get(entity_id)
                    if state is not None:
                        friendly_name = state.attributes.get("friendly_name", entity_id)
                        current_entities[entity_id] = {
                            "state": state.state,
                            "attributes": state.attributes,
                            "last_changed": state.last_changed,
                            "last_updated": state.last_updated,
                            "friendly_name": friendly_name,
                        }
            except Exception as err:
                _LOGGER.error("Error fetching entities: %s", err)
                return self.data

            # Detect newly added entities
            new_entities = {
                k: v
                for k, v in current_entities.items()
                if k not in self.previous_entities
            }

            if not new_entities:
                _LOGGER.debug("No new entities detected")
                return self.data

            # Limit processing to 10 entities if needed
            if len(new_entities) > 10:
                _LOGGER.debug("Limiting to 10 entities for processing")
                new_entities = dict(list(new_entities.items())[:10])

            # Prepare AI input
            ai_input_data = self.prepare_ai_input(new_entities)

            # Get suggestions from AI
            suggestions = await self.get_ai_suggestions(ai_input_data)

            if suggestions:
                _LOGGER.debug("Received suggestions: %s", suggestions)
                try:
                    # Create notification only if suggestions is not None
                    persistent_notification.async_create(
                        self.hass,
                        message=suggestions,
                        title="AI Automation Suggestions",
                        notification_id=f"ai_automation_suggestions_{current_time.timestamp()}",
                    )

                    # Update data regardless of notification success
                    self.data = {
                        "suggestions": suggestions,
                        "last_update": current_time,
                        "entities_processed": list(new_entities.keys()),
                        "provider": "oasira",
                    }
                except Exception as err:
                    _LOGGER.error("Error creating notification: %s", err)
                    # Still update data even if notification fails
                    self.data = {
                        "suggestions": suggestions,
                        "last_update": current_time,
                        "entities_processed": list(new_entities.keys()),
                        "provider": "oasira",
                    }
            else:
                _LOGGER.warning("No valid suggestions received from AI")
                self.data = {
                    "suggestions": "No suggestions available",
                    "last_update": current_time,
                    "entities_processed": [],
                    "provider": "oasira",
                }

            # Always update previous entities list
            self.previous_entities = current_entities

            return self.data

        except Exception as err:
            _LOGGER.error("Unexpected error in update: %s", err)
            return self.data

    def prepare_ai_input(self, new_entities):
        """Prepare the input data for AI processing."""
        _LOGGER.debug("Preparing AI input for %d entities", len(new_entities))

        entities_description = []
        for entity_id, entity_data in new_entities.items():
            state = entity_data.get("state", "unknown")
            attributes = entity_data.get("attributes", {})
            friendly_name = entity_data.get("friendly_name", entity_id)
            domain = entity_id.split(".")[0]

            # Enhanced entity description
            description = (
                f"Entity: {entity_id}\n"
                f"Friendly Name: {friendly_name}\n"
                f"Domain: {domain}\n"
                f"State: {state}\n"
                f"Attributes: {attributes}\n"
                f"Last Changed: {entity_data.get('last_changed', 'unknown')}\n"
                f"Last Updated: {entity_data.get('last_updated', 'unknown')}\n"
                f"---\n"
            )
            entities_description.append(description)

        prompt = (
            f"{self.SYSTEM_PROMPT}\n\n"
            f"New entities discovered:\n"
            f"{''.join(entities_description)}\n"
            f"Please suggest detailed and specific automations for these entities, "
            f"using their exact entity IDs in the suggestions."
        )
        return prompt

    async def get_ai_suggestions(self, prompt):
        """Get suggestions from the AI provider."""

        try:
            return await self.process_with_google(prompt)

        except Exception as err:
            _LOGGER.error("Error getting suggestions: %s", err)
            return None

    async def get_ai_suggestions_for_entity(self, call: ServiceCall):
        """Get suggestions from the AI provider."""

        entity_id = call.data.get("entity_id")
        entity = self.hass.states.get(entity_id)

        # history = await self.get_entity_state_history(self.hass, entity_id)

        # using the state history of the provided entity id ask AI to make recommendations to automate the entity

        initial_prompt = """You are an AI assistant that generates Home Assistant automations
        based on the history of usage of the provided entities. Your goal
        is to provide detailed and useful automation suggestions tailored to
        the specific types and functions of the entities, avoiding generic recommendations.

        For each entity:
        1. Understand its function (e.g., sensor, switch, light, climate control).
        2. Consider its historical state (e.g., 'on', 'off', 'open', 'closed', 'temperature').
        3. Suggest automations based on common use cases for similar entities.
        4. Avoid generic suggestions. Instead, provide detailed scenarios such as:
        - 'If the front door sensor detects it is open for more than 5 minutes, send a notification.'
        - 'If no motion is detected for 10 minutes, turn off all lights.'
        - 'If the temperature sensor detects a rise above 25°C, turn on the air conditioner.'
        5. Consider combining multiple entities to create context-aware automations.
        6. Include appropriate conditions and triggers for time of day, presence, or other contextual factors.
        7. Format suggestions in clear, implementable steps.
        8. When suggesting scenes, include all relevant entities that should be controlled.
        9. Consider energy efficiency and user convenience in your suggestions.
        10. Include the actual entity IDs in your suggestions so they can be easily implemented.
        11. Suggest automations that make sense based on the entity's domain and capabilities.
        12. Consider security implications for sensitive automations (like doors or windows)."""

        prompt = (
            f"{initial_prompt}\n\n"
            f"entity:"
            f"{ entity_id }\n"
            f"history:"
            f"{ entity }\n"
            f"Please suggest detailed and specific automations for these entities, "
            f"using their exact entity IDs in the suggestions."
        )

        try:
            suggestions = await self.process_with_google(prompt)

            # Create notification only if suggestions is not None
            persistent_notification.async_create(
                self.hass,
                message=suggestions,
                title="AI Entity Automation Suggestions",
                notification_id=f"ai_automation_suggestions_{entity_id}",
            )

        except Exception as err:
            _LOGGER.error("Error getting suggestions: %s", err)
            return None

    async def get_entity_state_history(hass, entity_id, start_time=None, end_time=None):
        """Retrieve state history for a specific entity_id."""
        recorder_instance = get_instance(hass)

        if start_time is None:
            # Set default start time to 24 hours ago
            from datetime import timedelta

            start_time = hass.helpers.event.dt_util.utcnow() - timedelta(hours=24)

        if end_time is None:
            # Set end time to now
            end_time = hass.helpers.event.dt_util.utcnow()

        # Query the state history
        with recorder_instance.get_session() as session:
            states = recorder_instance.get_states_for_entity_ids(
                session, [entity_id], start_time, end_time
            )

        # Convert LazyState to a dictionary for ease of use
        state_history = [
            {
                "state": state.state,
                "attributes": state.attributes,
                "last_updated": state.last_updated,
            }
            for state in states
            if isinstance(state, LazyState)
        ]

        return state_history

    async def process_with_google(self, prompt):
        """Process the prompt with Google."""
        try:
            api_key = "AIzaSyDZXGIUhDkULAWitkOnYfTJ-DbOz6a99lQ"
            model = "gemini-1.0-pro"
            max_tokens = DEFAULT_MAX_TOKENS

            if not api_key:
                raise ValueError("Google API key not configured")

            _LOGGER.debug("Making Google API request with model %s", model)

            headers = {
                "Content-Type": "application/json",
            }

            data = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": DEFAULT_TEMPERATURE,
                    "maxOutputTokens": max_tokens,
                    "topK": 40,
                    "topP": 0.95,
                },
            }

            endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"

            async with self.session.post(
                endpoint, headers=headers, json=data
            ) as response:
                if response.status != 200:
                    error_text = await response.text()
                    _LOGGER.error("Google API error: %s", error_text)
                    return None

                result = await response.json()
                try:
                    return result["candidates"][0]["content"]["parts"][0]["text"]
                except (KeyError, IndexError) as err:
                    _LOGGER.error("Error parsing Google API response: %s", err)
                    return None

        except Exception as err:
            _LOGGER.error("Error processing with Google: %s", err)
            return None
