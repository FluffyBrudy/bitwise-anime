import type { TBitwiseOperators } from "./types";

export class BitwiseOperations {
  calculate(val1: number, val2: number, operator: TBitwiseOperators): number {
    switch (operator) {
      case "&":
        return val1 & val2;
      case "|":
        return val1 | val2;
      case "^":
        return val1 ^ val2;
      case "~":
        return ~val1;
      case "<<":
        return val1 << val2;
      case ">>":
        return val1 >> val2;
      case ">>>":
        return val1 >>> val2;
      default:
        throw new Error(`Unknown operator: ${operator}`);
    }
  }

  getBinaryRepresentation(num: number, bitWidth = 32): string {
    return (num >>> 0).toString(2).padStart(bitWidth, "0");
  }

  getHexRepresentation(num: number): string {
    return "0x" + (num >>> 0).toString(16).toUpperCase();
  }

  validateInput(input: string): boolean {
    const num = Number.parseInt(input);
    return !isNaN(num) && isFinite(num);
  }
}
