export const parseDuration = (duration) => {
    const match = duration.match(/^(\d+)([smhd])$/);

    if (!match) {
        throw new Error(
            `Invalid duration "${duration}". Use formats like 15m, 1h, or 7d.`
        );
    }

    const value = Number(match[1]);
    const unit = match[2];

    const multipliers = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
    };

    return value * multipliers[unit];
};