import { Unique } from '../helpers';
import { EArmModes } from '../types';
export const modesByArea = (areaCfg) => Object.keys(areaCfg.modes).filter(mode => areaCfg.modes[mode].enabled);
export const getModesList = (config) => {
    let modes = [];
    Object.values(config).forEach(area => {
        modes = [...modes, ...modesByArea(area)];
    });
    modes = Unique(modes);
    modes.sort((a, b) => {
        const modesList = Object.values(EArmModes);
        const indexA = modesList.findIndex(e => e == a);
        const indexB = modesList.findIndex(e => e == b);
        return indexA - indexB;
    });
    return modes;
};
