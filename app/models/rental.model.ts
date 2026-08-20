import Model from '../core/base.model';

class RentalModel extends Model {
    public readonly table = 'rentals';
    public readonly primary_key = 'id';
    public readonly select = ['id', 'vehicle_id', 'customer_name', 'customer_phone', 'start_date', 'end_date', 'total_amount', 'status', 'created_at', 'updated_at'];
    protected readonly softDelete = false;
}

export default new RentalModel();
