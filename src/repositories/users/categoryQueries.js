import Category from "../../models/admin/category.js";

export const fetchActiveCategories = async () => {
    return await Category.find({ status: 'Active' }).sort({ name: 1 });
}
