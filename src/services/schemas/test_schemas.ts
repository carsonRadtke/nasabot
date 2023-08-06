import { describe, expect, test } from "@jest/globals"
import * as Validation from "."

describe('test_validation', () => {
  test('test_validateBoolean', () => {
    expect(Validation.validateBoolean("true")).toBe(true);
    expect(Validation.validateBoolean("false")).toBe(false);
    expect(Validation.validateBoolean("foo")).toBe(false);
    expect(Validation.validateBoolean(undefined)).toBe(undefined);
  });
  test('test_validateDate', () => {
    expect(Validation.validateDate("1776-07-04")).toBe("1776-07-04");
    expect(Validation.validateDate("1-1-1")).toBe(undefined);
    expect(Validation.validateDate(undefined)).toBe(undefined);
  })
  test('test_validateNumber', () => {
    expect(Validation.validateNumber("1")).toBe(1);
    expect(Validation.validateNumber("-1")).toBe(-1);
    expect(Validation.validateNumber("3.14")).toBe(3.14);
    expect(Validation.validateNumber(undefined)).toBe(undefined);
  });
});