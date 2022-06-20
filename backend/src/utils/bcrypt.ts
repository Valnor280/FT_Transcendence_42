import * as bcrypt from 'bcrypt';

export function encodePassword(rawPassword: string) {
	const SALT = bcrypt.genSaltSync();
	return bcrypt.hashSync(rawPassword, SALT);
}

export function comparePasswords(rawPassword: string, hash: string) {
	if (rawPassword == null && hash == null)
		return (true)
	if (rawPassword == null || hash == null)
		return (false);
	return bcrypt.compareSync(rawPassword, hash);
}