function preventFormulaInjection(value) {
  const text = String(value);
  return /^[\t\r ]*[=+\-@]/.test(text) ? `'${text}` : text;
}

function escapeCsv(value) {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = preventFormulaInjection(value).replace(/"/g, '""');
  return `"${stringValue}"`;
}

export function customersToCsv(customers) {
  const headers = ['id', 'name', 'company', 'email', 'phone', 'country', 'status', 'source', 'inquiries', 'createdAt'];
  const rows = customers.map((customer) => {
    const values = {
      ...customer,
      inquiries: customer._count?.inquiries || 0
    };
    return headers.map((header) => escapeCsv(values[header])).join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

export function inquiriesToCsv(inquiries) {
  const headers = [
    'id',
    'type',
    'name',
    'company',
    'email',
    'phone',
    'country',
    'product',
    'status',
    'message',
    'createdAt'
  ];

  const rows = inquiries.map((inquiry) =>
    headers.map((header) => escapeCsv(inquiry[header])).join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}
