<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Payment Receipt - {{ $payment->payment_id }}</title>
    <style>
        /* PDF engines like dompdf prefer DejaVu Sans for unicode support (₹) */
        body {
            font-family: 'DejaVu Sans', sans-serif;
            background-color: #f8fafc;
            color: #334155;
            margin: 0;
            padding: 20px;
            line-height: 1.4;
        }

        .invoice-card {
            background: #ffffff;
            max-width: 800px;
            margin: auto;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            overflow: hidden;
        }

        .accent-bar {
            height: 6px;
            background: #3b82f6;
        }

        .content { padding: 30px; }

        /* Header */
        .header-table {
            width: 100%;
            border-bottom: 1px solid #f1f5f9;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }

        .header-table h1 {
            font-size: 20px;
            text-transform: uppercase;
            color: #1e293b;
            margin: 0;
        }

        .status-badge {
            background: #dcfce7;
            color: #166534;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            text-align: center;
        }

        /* Metadata Grid using Table for PDF Compatibility */
        .meta-table {
            width: 100%;
            margin-bottom: 30px;
        }

        .meta-table label {
            display: block;
            font-size: 10px;
            text-transform: uppercase;
            color: #64748b;
            font-weight: bold;
            margin-bottom: 2px;
        }

        .meta-table span {
            font-size: 13px;
            font-weight: 500;
            color: #1e293b;
        }

        /* Items Table */
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }

        .items-table th {
            text-align: left;
            padding: 12px;
            font-size: 11px;
            text-transform: uppercase;
            color: #64748b;
            border-bottom: 2px solid #f1f5f9;
        }

        .items-table td {
            padding: 12px;
            border-bottom: 1px solid #f1f5f9;
            font-size: 13px;
        }

        .amount-col { text-align: right; }

        /* Summary */
        .summary-wrapper {
            width: 100%;
        }

        .summary-box {
            float: right;
            width: 220px;
            padding: 15px;
            background: #f8fafc;
            border-radius: 8px;
            text-align: right;
        }

        .summary-box label { font-size: 13px; color: #64748b; }
        .summary-box .total { 
            display: block;
            font-size: 18px; 
            font-weight: bold; 
            color: #3b82f6; 
            margin-top: 5px;
        }

        .footer {
            clear: both;
            margin-top: 50px;
            text-align: center;
            font-size: 11px;
            color: #64748b;
        }
    </style>
</head>
<body>

<div class="invoice-card">
    <div class="accent-bar"></div>
    <div class="content">
        
        <table class="header-table">
            <tr>
                <td>
                    <h1>Payment Receipt</h1>
                    <p style="font-size: 12px; color: #64748b; margin: 5px 0 0 0;">Thank you for your prompt payment.</p>
                </td>
                <td style="text-align: right; vertical-align: top;">
                    <span class="status-badge">{{ strtoupper($payment->payment_status) }}</span>
                </td>
            </tr>
        </table>

        <table class="meta-table">
            <tr>
                <td style="width: 33%;">
                    <label>Invoice ID</label>
                    <span>#{{ $payment->payment_id }}</span>
                </td>
                <td style="width: 33%;">
                    <label>Payment Date</label>
                    <span>{{ $payment->payment_date }}</span>
                </td>
                <td style="width: 33%;">
                    <label>Payment Mode</label>
                    <span>{{ strtoupper($payment->payment_mode) }}</span>
                </td>
            </tr>
            <tr>
                <td colspan="3" style="padding-top: 15px;">
                    <label>Transaction Reference</label>
                    <span style="font-family: monospace;">{{ $payment->transaction_id }}</span>
                </td>
            </tr>
        </table>

        <table class="items-table">
            <thead>
                <tr>
                    <th style="width: 10%;">#</th>
                    <th style="width: 65%;">Description</th>
                    <th class="amount-col">Amount</th>
                </tr>
            </thead>
            <tbody>
                @foreach($items as $index => $item)
                <tr>
                    <td>{{ str_pad($index + 1, 2, '0', STR_PAD_LEFT) }}</td>
                    <td>{{ $item->fee_name ?? ucfirst($item->fee_type) }}</td>
                    <td class="amount-col">₹ {{ number_format($item->amount, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <div class="summary-wrapper">
            <div class="summary-box">
                <label>Total Paid</label>
                <span class="total">₹ {{ number_format($payment->amount_paid, 2) }}</span>
            </div>
        </div>

        <div class="footer">
            <p>This is a digitally generated document. No physical signature is required.</p>
            <p style="margin-top: 5px;">&copy; {{ date('Y') }} Your School Name</p>
        </div>
    </div>
</div>

</body>
</html>