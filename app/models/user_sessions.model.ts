import Model from '../core/base.model';
class UserSessionModel extends Model {
    public readonly table = 'user_sessions';
    public readonly primaryKey = 'id';
    public readonly select = ['id', 'user_id', 'user_agent', 'token', 'ip', 'created_at', 'updated_at'];
}

export default new UserSessionModel(); 