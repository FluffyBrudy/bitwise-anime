export function bin(number: number) {
  const binRepr = number.toString(2);
  return binRepr;
}

export function decimal(binStr: string) {
  try {
    const decimal = parseInt(binStr, 2);
    return decimal;
  } catch (error) {
    console.error((error as Error).message);
    return null;
  }
}

export function padBinStr(str1: string, str2: string) {
  const [n1, n2] = [Number(str1), Number(str2)];
  const isInvalid = isNaN(n1) || isNaN(n2);

  if (isInvalid) {
    throw new Error("both string should be number");
  }

  const [bin1, bin2] = [n1.toString(2), n2.toString(2)];
  const maxLen = Math.max(bin1.length, bin2.length);
  return [bin1.padStart(maxLen, "0"), bin2.padStart(maxLen, "0")];
}
