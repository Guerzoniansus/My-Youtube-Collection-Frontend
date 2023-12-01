import { removeElementFromArray } from './RemoveElementFromArray';

fdescribe('removeElementFromArray', () => {
  it('should remove a number from an array of numbers', () => {
    const array = [1, 2, 3, 2];
    const element = 2;
    const result = removeElementFromArray(element, array);
    expect(result).toEqual([1, 3]);
  });

  it('should remove a string from an array of strings', () => {
    const array = ['a', 'b', 'c', 'b'];
    const element = 'b';
    const result = removeElementFromArray(element, array);
    expect(result).toEqual(['a', 'c']);
  });

  it('should remove a boolean from an array of booleans', () => {
    const array = [true, false, true];
    const element = true;
    const result = removeElementFromArray(element, array);
    expect(result).toEqual([false]);
  });

  it('should remove an object from an array of objects', () => {
    const a = { a: 1 };
    const b = { b: 2 };

    const array = [a, b, a];
    const element = a;

    const result = removeElementFromArray(element, array);
    expect(result).toEqual([b]);
  });

  it('should not remove an element that does not exist in the array', () => {
    const array = [1, 2, 3];
    const element = 4;
    const result = removeElementFromArray(element, array);
    expect(result).toEqual([1, 2, 3]);
  });

  it('should return an empty array when the input array is empty', () => {
    const array: any[] = [];
    const element = 1;
    const result = removeElementFromArray(element, array);
    expect(result).toEqual([]);
  });
});
