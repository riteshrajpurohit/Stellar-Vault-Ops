export function shortenAddress(
  address: string,
  headLength = 5,
  tailLength = 4,
) {
  if (!address || address.length <= headLength + tailLength + 3) {
    return address;
  }

  return `${address.slice(0, headLength)}...${address.slice(-tailLength)}`;
}
