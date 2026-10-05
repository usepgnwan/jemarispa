<?php

namespace App\Exceptions;

use RuntimeException;

class FcmException extends RuntimeException
{
    public function __construct(public string $fcmCode, public bool $retryable = false)
    {
        parent::__construct('FCM: '.$fcmCode);
    }
}
