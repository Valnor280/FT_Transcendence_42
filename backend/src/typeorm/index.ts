import { User } from './User';
import { MatchHistory } from './matchHistory.entity';
import { DatabaseFile } from './dataFile.entity';
import { blocMessages } from './blocMessages.entity';
import { chatRoomId } from './chatRoomId.entity';
import { Encrypted2fa } from './Encrypted2fa.entity';
import { Achievement } from './Achievement.entity';
import { roomLog } from './roomLog.entity';

const entities = [User, MatchHistory, DatabaseFile, blocMessages, chatRoomId, Encrypted2fa, Achievement, roomLog];

export { User, MatchHistory, DatabaseFile, Encrypted2fa, blocMessages, chatRoomId, Achievement, roomLog};

export default entities;
