import Model from '../core/base.model';

class StaffModel extends Model {
    public readonly table = 'staff';
    public readonly primary_key = 'id';
    public readonly select = ['id', 'name', 'email', 'created_at', 'updated_at'];
    protected readonly softDelete = false;
}

export default new StaffModel();
