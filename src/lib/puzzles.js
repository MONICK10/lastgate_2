export function validateTask1(path) {
  return path.join("-") === "A-B-D-F";
}

export function validateTask2(keyword) {
  return keyword.toLowerCase() === "vecna";
}

export function validateTask3(sequence) {
  return sequence === "0110";
}
