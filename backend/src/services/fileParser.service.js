const URL_PATTERN = /https?:\/\/[^\s"'<>]+|www\.[^\s"'<>]+/gi;

function unique(values) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function normalizeUrl(value) {
  return value.startsWith("www.") ? `https://${value}` : value;
}

function parseJson(content) {
  try {
    const parsed = JSON.parse(content);
    const flattened = JSON.stringify(parsed);
    return extractScanItems(flattened, "json");
  } catch (_error) {
    return [];
  }
}

function parseCsv(content) {
  return unique(content.split(/\r?\n/).flatMap((line) => line.split(",")))
    .filter((value) => value.length > 3)
    .slice(0, 30);
}

function splitTextBlocks(content) {
  return unique(
    content
      .split(/\n{2,}|(?=Subject:)|(?=From:)|(?=To:)/i)
      .map((block) => block.replace(/\s+/g, " ").trim())
  ).filter((block) => block.length >= 20);
}

export function extractScanItems(content, extension = "txt") {
  if (extension === "json") {
    const jsonItems = parseJson(content);
    if (jsonItems.length) return jsonItems;
  }

  const urls = unique(content.match(URL_PATTERN) || []).map(normalizeUrl);
  const items = urls.map((url, index) => ({
    type: "url",
    content: url,
    sourceLabel: `URL ${index + 1}`
  }));

  if (extension === "csv") {
    parseCsv(content).forEach((value, index) => {
      if (!/https?:\/\/[^\s"'<>]+|www\.[^\s"'<>]+/i.test(value)) {
        items.push({ type: "text", content: value, sourceLabel: `CSV row ${index + 1}` });
      }
    });
  }

  splitTextBlocks(content).forEach((block, index) => {
    items.push({ type: "text", content: block.slice(0, 12000), sourceLabel: `Message block ${index + 1}` });
  });

  return unique(items.map((item) => `${item.type}:${item.content}`))
    .map((key) => {
      const [type, ...rest] = key.split(":");
      const contentValue = rest.join(":");
      return items.find((item) => item.type === type && item.content === contentValue);
    })
    .filter(Boolean)
    .slice(0, 20);
}
