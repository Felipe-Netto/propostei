import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';
import type { Prisma } from '../generated/prisma/client';
type Decimal = Prisma.Decimal;

interface QuoteItem {
    description: string;
    quantity: Decimal;
    unitPrice: Decimal;
    total: Decimal;
}

interface QuoteClient {
    name: string;
    document: string | null;
    phone: string | null;
    email: string | null;
}

interface QuoteCompany {
    name: string;
    document: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    logoUrl: string | null;
}

export interface QuoteForPdf {
    title: string;
    description: string | null;
    status: string;
    subtotal: Decimal;
    discount: Decimal;
    total: Decimal;
    validUntil: Date | null;
    createdAt: Date;
    client: QuoteClient;
    company: QuoteCompany;
    items: QuoteItem[];
}

@Injectable()
export class PdfService {
    private fmt(value: Decimal | number): string {
        return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    private fmtDate(date: Date): string {
        return date.toLocaleDateString('pt-BR');
    }

    private buildHtml(quote: QuoteForPdf): string {
        const { company, client, items } = quote;

        const itemRows = items
            .map(
                (item) => `
            <tr>
                <td>${item.description}</td>
                <td class="center">${Number(item.quantity)}</td>
                <td class="right">${this.fmt(item.unitPrice)}</td>
                <td class="right">${this.fmt(item.total)}</td>
            </tr>`,
            )
            .join('');

        const discountRow =
            Number(quote.discount) > 0
                ? `<tr class="subtotal-row">
                    <td colspan="3" class="right label">Desconto</td>
                    <td class="right discount">- ${this.fmt(quote.discount)}</td>
                   </tr>`
                : '';

        const companyInfo = [company.document, company.phone, company.email, company.address]
            .filter(Boolean)
            .join(' · ');

        const clientInfo = [client.document, client.phone, client.email].filter(Boolean).join(' · ');

        const validUntil = quote.validUntil
            ? `<p><strong>Válida até:</strong> ${this.fmtDate(quote.validUntil)}</p>`
            : '';

        const logo = company.logoUrl
            ? `<img src="${company.logoUrl}" alt="Logo" class="logo" />`
            : '';

        return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 13px;
      color: #1e293b;
      background: #fff;
      padding: 48px 56px;
    }

    /* ── Header ── */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 36px;
    }
    .logo {
      max-height: 56px;
      max-width: 180px;
      object-fit: contain;
    }
    .company-name {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 4px;
    }
    .company-info {
      font-size: 11px;
      color: #64748b;
      margin-top: 4px;
    }
    .header-right {
      text-align: right;
    }
    .proposal-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #0d9488;
      margin-bottom: 4px;
    }
    .proposal-title {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      max-width: 260px;
    }
    .proposal-date {
      font-size: 11px;
      color: #94a3b8;
      margin-top: 4px;
    }

    /* ── Divider ── */
    .divider {
      border: none;
      border-top: 1px solid #e2e8f0;
      margin: 24px 0;
    }

    /* ── Client / Description block ── */
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 32px;
    }
    .meta-block h3 {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #94a3b8;
      margin-bottom: 8px;
    }
    .meta-block p {
      font-size: 13px;
      color: #1e293b;
      margin-bottom: 3px;
      line-height: 1.5;
    }
    .meta-block .sub {
      font-size: 11px;
      color: #64748b;
    }

    /* ── Items table ── */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 0;
    }
    thead th {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #94a3b8;
      padding: 8px 10px;
      border-bottom: 1px solid #e2e8f0;
    }
    thead th:first-child { text-align: left; }
    thead th.center { text-align: center; }
    thead th.right { text-align: right; }

    tbody td {
      padding: 10px 10px;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: top;
      line-height: 1.45;
    }
    tbody td.center { text-align: center; color: #475569; }
    tbody td.right { text-align: right; color: #475569; }

    /* ── Totals ── */
    .totals {
      margin-top: 0;
      border-top: 1px solid #e2e8f0;
    }
    .totals table { margin: 0; }
    .totals td {
      padding: 8px 10px;
      border: none;
    }
    .subtotal-row td { color: #64748b; font-size: 12px; }
    td.label { font-size: 12px; color: #64748b; }
    td.discount { color: #ef4444; }
    .total-row td {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      padding-top: 10px;
      border-top: 2px solid #0d9488;
    }

    /* ── Footer ── */
    .footer {
      margin-top: 48px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      font-size: 11px;
      color: #94a3b8;
      text-align: center;
    }
  </style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <div>
      ${logo}
      <div class="company-name">${company.name}</div>
      ${companyInfo ? `<div class="company-info">${companyInfo}</div>` : ''}
    </div>
    <div class="header-right">
      <div class="proposal-label">Proposta comercial</div>
      <div class="proposal-title">${quote.title}</div>
      <div class="proposal-date">Emitida em ${this.fmtDate(quote.createdAt)}</div>
    </div>
  </div>

  <hr class="divider" />

  <!-- Meta -->
  <div class="meta-grid">
    <div class="meta-block">
      <h3>Cliente</h3>
      <p>${client.name}</p>
      ${clientInfo ? `<p class="sub">${clientInfo}</p>` : ''}
    </div>
    <div class="meta-block">
      <h3>Detalhes</h3>
      ${validUntil}
      ${quote.description ? `<p class="sub">${quote.description}</p>` : ''}
    </div>
  </div>

  <!-- Items -->
  <table>
    <thead>
      <tr>
        <th>Descrição</th>
        <th class="center">Qtd</th>
        <th class="right">Valor unit.</th>
        <th class="right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
    </tbody>
  </table>

  <!-- Totals -->
  <div class="totals">
    <table>
      <tbody>
        <tr class="subtotal-row">
          <td colspan="3" class="right label">Subtotal</td>
          <td class="right">${this.fmt(quote.subtotal)}</td>
        </tr>
        ${discountRow}
        <tr class="total-row">
          <td colspan="3" class="right">Total</td>
          <td class="right">${this.fmt(quote.total)}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="footer">
    Este documento foi gerado automaticamente e não requer assinatura.
  </div>

</body>
</html>`;
    }

    async generatePdf(quote: QuoteForPdf): Promise<Buffer> {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        try {
            const page = await browser.newPage();
            await page.setContent(this.buildHtml(quote), { waitUntil: 'load' });

            const pdf = await page.pdf({
                format: 'A4',
                margin: { top: '0', right: '0', bottom: '0', left: '0' },
                printBackground: true,
            });

            return Buffer.from(pdf);
        } finally {
            await browser.close();
        }
    }
}
