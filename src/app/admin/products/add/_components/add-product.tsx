"use client";

import {
  ProductForm,
  type ProductFormValues,
} from "~/app/admin/_components/forms/product-form";

export function AddProduct() {
  function onSubmit(data: ProductFormValues) {
    console.log(data);
  }

  return (
    <div>
      <ProductForm onSubmit={onSubmit} />
    </div>
  );
}
