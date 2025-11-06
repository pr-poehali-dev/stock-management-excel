import { ActItem, ActData } from "./types";

export function generateActHTML(
  actData: ActData, 
  items: ActItem[], 
  totalSum: number
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Акт списания ${actData.actNumber}</title>
      <style>
        @media print {
          @page { margin: 2cm; }
        }
        body {
          font-family: 'Times New Roman', serif;
          font-size: 12pt;
          line-height: 1.5;
          max-width: 21cm;
          margin: 0 auto;
          padding: 1cm;
        }
        .header {
          text-align: center;
          margin-bottom: 2cm;
        }
        .header h1 {
          font-size: 16pt;
          font-weight: bold;
          margin: 0.5cm 0;
        }
        .info {
          margin-bottom: 1cm;
        }
        .info p {
          margin: 0.3cm 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 1cm 0;
        }
        th, td {
          border: 1px solid black;
          padding: 0.3cm;
          text-align: left;
        }
        th {
          background-color: #f0f0f0;
          font-weight: bold;
        }
        .total {
          text-align: right;
          font-weight: bold;
          margin-top: 0.5cm;
        }
        .signatures {
          margin-top: 2cm;
        }
        .signature-line {
          margin: 1cm 0;
          display: flex;
          justify-content: space-between;
        }
        .signature-line span {
          border-bottom: 1px solid black;
          padding: 0 2cm;
        }
      </style>
    </head>
    <body>
      ${actData.approvedBy ? `
      <div style="text-align: right; margin-bottom: 1cm;">
        <p><strong>Утверждено:</strong></p>
        <p>${actData.approvedBy}</p>
        <p>________________</p>
      </div>
      ` : ''}
      
      <div class="header">
        <h1>${actData.actTitle || 'АКТ СПИСАНИЯ ТОВАРНО-МАТЕРИАЛЬНЫХ ЦЕННОСТЕЙ'}</h1>
        <p>№ ${actData.actNumber} от ${new Date(actData.date).toLocaleDateString('ru-RU')}</p>
      </div>

      <div class="info">
        <p><strong>Ответственное лицо:</strong> ${actData.responsible || '_________________'}</p>
        <p><strong>Комиссия по списанию:</strong></p>
        <ul>
          ${actData.commissionMembers.filter(m => m.trim()).map(member => `<li>${member}</li>`).join('') || '<li>_________________</li>'}
        </ul>
      </div>

      <p>Настоящий акт составлен о том, что комиссия произвела списание следующих товарно-материальных ценностей:</p>

      <table>
        <thead>
          <tr>
            <th>№</th>
            <th>Наименование</th>
            <th>Артикул</th>
            <th>Количество</th>
            <th>Цена, ₽</th>
            <th>Сумма, ₽</th>
            <th>Причина списания</th>
          </tr>
        </thead>
        <tbody>
          ${items.filter(item => item.product).map((item, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td>${item.product?.name}</td>
              <td>${item.product?.sku}</td>
              <td>${item.quantity} шт</td>
              <td>${item.product?.price.toLocaleString('ru-RU')}</td>
              <td>${((item.product?.price || 0) * item.quantity).toLocaleString('ru-RU')}</td>
              <td>${item.reason}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="total">
        <p>Итого списано на сумму: ${totalSum.toLocaleString('ru-RU')} ₽</p>
      </div>

      <div class="signatures">
        <p><strong>Подписи:</strong></p>
        ${actData.signers.filter(s => s.position || s.name).map(signer => `
          <div class="signature-line">
            <span>${signer.position || '_________________'}</span>
            <span>______________ / ${signer.name || '_________________'}</span>
          </div>
        `).join('')}
        ${actData.signers.filter(s => s.position || s.name).length === 0 ? `
          <div class="signature-line">
            <span>_________________</span>
            <span>______________ / _________________</span>
          </div>
        ` : ''}
      </div>
    </body>
    </html>
  `;
}

export function printActDocument(html: string): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.onload = () => {
    printWindow.print();
  };
}