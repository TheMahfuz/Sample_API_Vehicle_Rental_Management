import { instance } from '../config/database';

interface ModelData {
    [key: string]: any;
}
/**
 * Instructions to use the Model class:
 * 
 * 1. Create a new model class that extends the base Model class.
 * 2. Define the table name, primary key, and select fields in the constructor of the new model class.
 * 3. If you want to use soft delete functionality, set the softDelete property to true in the constructor.
 * 4. Ensure your table has the following fields for soft delete functionality:
 *    - deleted_at: datetime (default value should be null)
 *    - is_deleted: boolean (default value should be 0)
 * 
 * Example:
 * 
 * class UserModel extends Model {
 *     constructor() {
 *         super();
 *         this.table = 'users';
 *         this.primary_key = 'id';
 *         this.select = ['id', 'name', 'email', 'created_at', 'updated_at'];
 *         this.softDelete = true; // Enable soft delete
 *     }
 * }
 *
 */

class Model {
    public readonly db: any;
    public readonly table: string;
    public readonly primary_key: string;
    public readonly select: string[];
    protected softDelete: boolean = false;

    constructor() {
        this.db = instance;
    }

    /**
     * 
     * @return <promise> query builder 
     */
    qb() {
        let query = this.db(this.table);
        if (this.softDelete) {
            query = query.whereNull(`${this.table}.deleted_at`);
        }
        return query;
    }

    /**
     * Run a callback inside a database transaction.
     * @param cb Callback that receives the transaction object
     * @returns Promise<T>
     */
    async transaction<T>(cb: (trx: any) => Promise<T>): Promise<T> {
        return this.db.transaction(cb);
    }

    /**
     * 
     * @param data JSON data 
     * @param trx Optional transaction to run the insert within
     * @return Promise<number>
     */
    async save(data: ModelData, trx?: any): Promise<number[]> {
        const query = this.db(this.table).insert(data);
        return trx ? query.transacting(trx) : query;
    }

    /**
     * 
     * @param conditions Object conditions 
     * @returns Promise<ModelData[]>
     */
    async get(conditions?: ModelData): Promise<ModelData[]> {
        let query = this.db(this.table).where(conditions || {}).select(this.select);
        if (this.softDelete) {
            query = query.whereNull(`${this.table}.deleted_at`);
        }
        return query;
    }

    /**
     * 
     * @param conditions object conditions 
     * @returns Promise<ModelData>
     */
    async find(conditions?: ModelData): Promise<ModelData | null> {
        let query = this.db(this.table).where(conditions || {}).select(this.select).first();
        if (this.softDelete) {
            query = query.whereNull(`${this.table}.deleted_at`);
        }
        return query
    }

    /**
     * 
     * @param conditions Object conditions 
     * @returns Promise<number>
     */
    async delete(conditions: ModelData, trx?: any): Promise<number> {
        if (this.softDelete) {
            let soft_delete_data: ModelData = { deleted_at: this.db.fn.now() };
            // check the table has is_active field
            const resp = await this.db.raw(`SHOW COLUMNS FROM ${this.table} WHERE Field = 'is_active'`);
            if (resp[0].length > 0) {
                soft_delete_data['is_active'] = null;
            }
            const query = this.db(this.table).where(conditions).whereNull(`${this.table}.deleted_at`).update(soft_delete_data);
            return trx ? query.transacting(trx) : query;
        } else {
            const query = this.db(this.table).where(conditions).del();
            return trx ? query.transacting(trx) : query;
        }
    }

    /**
     * 
     * @param condition Object condition 
     * @param data Object data 
     * @returns Promise<number>
     */
    async update(condition: ModelData, data: ModelData, trx?: any): Promise<number> {
        const query = this.db(this.table).where(condition).update(data);
        return trx ? query.transacting(trx) : query;
    }

    /**
     * 
     * @param conditions Object condition 
     * @param insert_data Object insert_data 
     * @returns Promise<ModelData>
     */
    async firstOrCreate(conditions: ModelData, insert_data?: ModelData): Promise<ModelData> {
        try {
            let query = this.db(this.table).where(conditions).select(this.select).first();
            if (this.softDelete) {
                query = query.whereNull(`${this.table}.deleted_at`);
            }
            let row = await query;
            if (row) return row;
            else {
                const insert_id = await this.db(this.table).insert(insert_data ?? conditions);
                row = await this.db(this.table).where({ id: insert_id[0] }).select(this.select).first();
                return row;
            }
        } catch (err) {
            return Promise.reject(err);
        }
    }

    /**
     * Get paginated results
     * @param page number Current page number
     * @param limit number Items per page
     * @param query Knex.QueryBuilder query (optional)
     * @returns Promise<{rows: ModelData[], total: number, current_page: number, limit: number, offset: number}>
     */
    async paginate(page: number = 1, limit: number = 10, query?: any): Promise<{ rows: ModelData[], total_rows: number, current_page: number, limit: number }> {
        try {
            query = query || this.qb().orderBy(`${this.table}.id`, 'desc');
            const offset = (page - 1) * limit;

            if (this.softDelete) {
                query = query.whereNull(`${this.table}.deleted_at`);
            }

            const [rows, total] = await Promise.all([
                query.clone()
                    .limit(limit)
                    .offset(offset),
                query.clone().clearSelect().count('* as count').first()
            ]);

            return {
                total_rows: parseInt(total.count),
                current_page: page,
                limit,
                rows
            };
        } catch (err) {
            return Promise.reject(err);
        }
    }
}

export default Model;