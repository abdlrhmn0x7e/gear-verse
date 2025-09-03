export function base64Encode(value: string) {
  return Buffer.from(value).toString("base64");
}

export function base64Decode(value: string) {
  return Buffer.from(value, "base64").toString("utf-8");
}

export function base64EncodeNumber(value: number) {
  return base64Encode(value.toString());
}

export function base64DecodeNumber(value: string) {
  return Number(base64Decode(value));
}
