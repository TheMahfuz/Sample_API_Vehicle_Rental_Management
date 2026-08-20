import Model from '../core/base.model';

class VehicleModel extends Model {
    public readonly table = 'vehicles';
    public readonly primary_key = 'id';
    public readonly select = ['id', 'name', 'plate_number', 'category', 'daily_rate', 'photo_path', 'created_at', 'updated_at'];
    protected readonly softDelete = true;
}

export default new VehicleModel();
