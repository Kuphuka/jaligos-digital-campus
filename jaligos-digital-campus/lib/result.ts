export type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };
