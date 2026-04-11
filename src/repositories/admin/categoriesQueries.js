import Category from "../../models/admin/category.js";


export const fetchAllCategories = async (queryFilter)=>{
    return await Category.find(queryFilter)
}

export const createCategory = async (data) => {
    const {name, description, icon, color, featured} = data
    const newCategory = new Category({
        name: name,
        description: description,
        icon: icon,
        color: color,
        featured: featured,
    })
    await newCategory.save()
    return newCategory
}

export const getCategoryById = async (id) =>{
    return await Category.findById(id)
}

export const deleteCategory = async (id) =>{
    const deletedCategory =  await Category.findByIdAndDelete(id)
    if(deletedCategory){
        return true
    }else{
        return false
    }
}