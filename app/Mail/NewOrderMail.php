<?php

namespace App\Mail;

use App\Models\Setting;
use App\Models\Transaction;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewOrderMail extends Mailable
{
    use Queueable, SerializesModels;

    public ?Setting $settings;

    public function __construct(public Transaction $transaction)
    {
        $this->settings = Setting::first();
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Pesanan Baru ' . $this->transaction->order_number,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.new-order',
        );
    }
}
