export interface singUp{
    name:string
    email:string
    password:string
}

export interface login{
    email:string,
    password:string
}

export interface product{
    commentCount: number;
    name:string,
    price:number,
    color:string,
    category:string,
    description:string,
    url:string,
    productId:undefined|number,
    id:string,
    quantity:undefined|number
    isCampaign: boolean;
    isPopular: boolean;
}

export interface cart{
    name:string,
    price:number,
    color:string,
    category:string,
    description:string,
    url:string,
    id:string|undefined,
    quantity:undefined|number,
    userId:number,
    productId:string
}

export interface priceSummary{
    price:number,
    discount:number,
    tax:number,
    delivery:number,
    total:number
}
export interface  order{
    email:string,
    address:string,
    contact:string,
    totalPrice:number,
    userId:number,
    id:number|undefined
    paymentMethod:string,
    shippingCompany:string,
    cardNumber?: string, // Opsiyonel
    expiryDate?: string, // Opsiyonel
    cvc?: string, // Opsiyonel
    deliveryTime?: string, // Yeni alan
}
