function fromUnixDate(timestamp: number) {
    return new Date(timestamp * 1000);
}

export { fromUnixDate };
