import React, { useState, useCallback, useEffect } from 'react';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import {
    MagnifyingGlassIcon,
    ShoppingCartIcon,
    EyeIcon,
    TrashIcon,
    CheckCircleIcon,
    ArrowPathIcon,
    DocumentTextIcon,
    TruckIcon,
    ChatBubbleLeftRightIcon,
    ArrowDownTrayIcon,
    ShoppingBagIcon,
    StarIcon,
    LinkIcon,
    ClipboardDocumentListIcon,
    CreditCardIcon,
    PlusIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { Select } from '@headlessui/react';
import ReactSelect from 'react-select';

// Custom debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const calculateEndTime = (startTime, durationMinutes) => {
    if (!startTime) return '';
    // Handle both HH:mm and HH.mm formats
    const [hours, minutes] = startTime.split(/[:.]/).map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes + parseInt(durationMinutes || 0));
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
};

const getTransactionTimeRange = (transaction) => {
    if (!transaction || !transaction.items) return transaction?.schedule_time || '';
    const guestDurations = {};
    transaction.items.forEach(item => {
        const gIdx = item.guest_index || 1;
        guestDurations[gIdx] = (guestDurations[gIdx] || 0) + parseInt(item.package_duration || 0);
    });
    const maxDuration = Math.max(...Object.values(guestDurations), 0);
    const startTime = (transaction.schedule_time || '00:00').substring(0, 5).replace('.', ':');
    const endTime = calculateEndTime(startTime, maxDuration);
    return `${startTime} - ${endTime}`;
};

const statusColors = {
    pending: 'bg-gray-100 text-gray-700 border-gray-200',
    send_terapis: 'bg-blue-100 text-blue-700 border-blue-200',
    invoice: 'bg-amber-100 text-amber-700 border-amber-200',
    success: 'bg-green-100 text-green-700 border-green-200',
    failed: 'bg-red-100 text-red-700 border-red-200',
};

const statusIcons = {
    pending: ArrowPathIcon,
    send_terapis: TruckIcon,
    invoice: DocumentTextIcon,
    success: CheckCircleIcon,
    failed: TrashIcon,
};

const defaultInvoiceTemplate = `Halo, Kak [name],
Terlampir Invoice [invoice_no] dengan detail pesanan sebagai berikut :

[details]
Biaya Transport : [transport]
[discount]-
*Total Pembayaran : [total]*


Untuk file invoice bisa di download di sini [link]
-


Pembayaran bisa melalui terapis kami atau transfer melalui rekening berikut :
BCA a.n Acep Dani : 7772554756
(Kirimkan bukti transfer, dan nama pemilik rekening setelah melakukan pembayaran)


-
Silahkan lampirkan kritik dan saran untuk pelayanan kami melalui link berikut
[link_review]


Terima kasih telah menggunakan jasa Jemari Home Spa
jemarihomespa.com`;

const cleanPackageName = (name) => String(name || '').replace(/\s+\d+\s*(menit|minutes|mins|min)\b/gi, '').trim();
const formatDurationLabel = (duration) => {
    let minutesVal = parseInt(String(duration || '').match(/\d+/)?.[0]);
    if (!minutesVal) return '';
    if (minutesVal >= 600) {
        minutesVal = Math.round(minutesVal / 60);
    }
    return `${minutesVal} Menit`;
};
const formatPackagePrice = (price) => `Rp ${Math.round(parseFloat(price || 0)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;

export default function Index({ transactions, filters, counts, employees, packages }) {
    const { flash, app_settings } = usePage().props;
    const [search, setSearch] = useState(filters?.search || '');
    const [limit, setLimit] = useState(filters?.limit || 10);
    const [activeTab, setActiveTab] = useState(filters?.tab || 'recent');
    const [dateFrom, setDateFrom] = useState(filters?.date_from || '');
    const [dateTo, setDateTo] = useState(filters?.date_to || '');
    const [therapistId, setTherapistId] = useState(filters?.therapist_id || '');
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [expandedRows, setExpandedRows] = useState({});
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const [reviewLinkCopied, setReviewLinkCopied] = useState(null);
    const [originalScheduleDate, setOriginalScheduleDate] = useState(null);
    const [newItems, setNewItems] = useState([]);
    const [deletedItems, setDeletedItems] = useState([]);
    const [penaltyPercent, setPenaltyPercent] = useState(0);
    const [pendingDeleteItemId, setPendingDeleteItemId] = useState(null);

    // State for Invoice Payment Option Modal
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [invoiceTransaction, setInvoiceTransaction] = useState(null);
    const [invoiceAction, setInvoiceAction] = useState('send'); // 'send' or 'copy'
    const [invoiceLang, setInvoiceLang] = useState('id'); // 'id' or 'en'
    const [paymentType, setPaymentType] = useState('full'); // 'full' or 'dp'
    const [dpAmount, setDpAmount] = useState('');
    const [previewMessage, setPreviewMessage] = useState('');

    // State for Profil Terapis Link Modal
    const [isTherapistLinkModalOpen, setIsTherapistLinkModalOpen] = useState(false);
    const [therapistModalSearch, setTherapistModalSearch] = useState('');

    const { patch, delete: destroy, processing } = useForm();

    const getItemDurationLabel = (item) => {
        // 1. Join langsung dari package_id & package_duration_id
        if (item.package_id && item.package_duration_id) {
            const pkg = (packages || []).find(p => p.id == item.package_id);
            const dur = pkg?.durations?.find(d => d.id == item.package_duration_id);
            if (dur && dur.duration) {
                return formatDurationLabel(dur.duration);
            }
        }
        if (item.package_id) {
            const pkg = (packages || []).find(p => p.id == item.package_id);
            if (pkg && pkg.durations && pkg.durations.length > 0) {
                let dur = null;
                if (item.price) {
                    dur = pkg.durations.find(d => parseFloat(d.price) === parseFloat(item.price));
                }
                if (!dur && item.therapist_commission) {
                    dur = pkg.durations.find(d => parseFloat(d.commission) === parseFloat(item.therapist_commission));
                }
                if (!dur) {
                    dur = pkg.durations[0];
                }
                if (dur && dur.duration) {
                    return formatDurationLabel(dur.duration);
                }
            }
        }
        if (item.package_duration) {
            return formatDurationLabel(item.package_duration);
        }
        return '';
    };

    const getItemSelectValue = (item) => {
        // 1. Join langsung dari package_id & package_duration_id
        if (item.package_id && item.package_duration_id) {
            const pkg = (packages || []).find(p => p.id == item.package_id);
            if (pkg) {
                const dIdx = (pkg.durations || []).findIndex(d => d.id == item.package_duration_id);
                if (dIdx !== -1) {
                    return `${pkg.id}|${dIdx}`;
                }
            }
        }
        if (item.package_id) {
            const pkg = (packages || []).find(p => p.id == item.package_id);
            if (pkg) {
                let dIdx = -1;
                if (item.package_duration) {
                    dIdx = (pkg.durations || []).findIndex(d => formatDurationLabel(d.duration) === formatDurationLabel(item.package_duration));
                }
                if (dIdx === -1 && item.price) {
                    dIdx = (pkg.durations || []).findIndex(d => parseFloat(d.price) === parseFloat(item.price));
                }
                if (dIdx === -1 && item.therapist_commission) {
                    dIdx = (pkg.durations || []).findIndex(d => parseFloat(d.commission) === parseFloat(item.therapist_commission));
                }
                if (dIdx === -1 && pkg.durations && pkg.durations.length > 0) {
                    dIdx = 0;
                }
                if (dIdx !== -1) {
                    return `${pkg.id}|${dIdx}`;
                }
            }
        }

        // 2. Fallback untuk item lama tanpa ID
        const cleanName = cleanPackageName(item.package_name);
        let pkg = (packages || []).find(p => p.title_id === item.package_name || p.title_id === cleanName);
        if (!pkg && item.package_name) {
            pkg = [...(packages || [])].sort((a, b) => b.title_id.length - a.title_id.length).find(p => String(item.package_name || '').startsWith(p.title_id) || String(cleanName).startsWith(p.title_id));
        }
        if (pkg) {
            const dIdx = (pkg.durations || []).findIndex(d => {
                return formatDurationLabel(d.duration) === formatDurationLabel(item.package_duration);
            });
            if (dIdx !== -1) {
                return `${pkg.id}|${dIdx}`;
            }
        }
        return '';
    };

    const getItemSelectLabel = (item) => {
        // 1. Join langsung dari package_id & package_duration_id
        if (item.package_id) {
            const pkg = (packages || []).find(p => p.id == item.package_id);
            if (pkg) {
                let durLabel = '';
                if (item.package_duration_id) {
                    const dur = pkg.durations?.find(d => d.id == item.package_duration_id);
                    if (dur && dur.duration) {
                        durLabel = formatDurationLabel(dur.duration);
                    }
                }
                if (!durLabel) {
                    durLabel = getItemDurationLabel(item);
                }
                return `${pkg.title_id} ${durLabel}`.trim();
            }
        }

        // 2. Fallback to name and formatted duration
        const name = item.package_name || '';
        const durLabel = getItemDurationLabel(item);
        if (durLabel && !String(name).toLowerCase().includes(durLabel.toLowerCase())) {
            return `${name} ${durLabel}`.trim();
        }
        return name;
    };

    React.useEffect(() => {
        if (flash?.message) {
            setToastMessage(flash.message);
            setShowToast(true);
            const timer = setTimeout(() => setShowToast(false), 1500);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const fetchFilteredData = useCallback(
        debounce((query, limitValue, tabValue, fromVal, toVal, therapistVal) => {
            router.get(
                route('admin.transaction.index'),
                {
                    search: query,
                    limit: limitValue,
                    tab: tabValue,
                    date_from: fromVal,
                    date_to: toVal,
                    therapist_id: therapistVal
                },
                { preserveState: true, replace: true }
            );
        }, 300),
        []
    );

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        fetchFilteredData(e.target.value, limit, activeTab, dateFrom, dateTo, therapistId);
    };

    const handleLimitChange = (e) => {
        setLimit(e.target.value);
        fetchFilteredData(search, e.target.value, activeTab, dateFrom, dateTo, therapistId);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        fetchFilteredData(search, limit, tab, dateFrom, dateTo, therapistId);
    };

    const handleDateFrom = (e) => {
        setDateFrom(e.target.value);
        fetchFilteredData(search, limit, activeTab, e.target.value, dateTo, therapistId);
    };

    const handleDateTo = (e) => {
        setDateTo(e.target.value);
        fetchFilteredData(search, limit, activeTab, dateFrom, e.target.value, therapistId);
    };

    const clearDateFilter = () => {
        setDateFrom('');
        setDateTo('');
        fetchFilteredData(search, limit, activeTab, '', '', therapistId);
    };

    const handleTherapistChange = (selectedOption) => {
        const newId = selectedOption && selectedOption.target ? selectedOption.target.value : (selectedOption ? selectedOption.value : '');
        setTherapistId(newId);
        fetchFilteredData(search, limit, activeTab, dateFrom, dateTo, newId);
    };

    const saveTransaction = () => {
        // Filter out placeholder items (no package selected yet)
        const realNewItems = newItems.filter(item => !item.isPlaceholder && item.package_name);

        // Calculate total price including existing items, new items, transport, and penalty
        const baseTotal = selectedTransaction.items.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);
        const newItemsTotal = realNewItems.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);
        const transport = parseFloat(selectedTransaction.transport_fee || 0);

        // Apply discount if exists
        const subtotal = baseTotal + newItemsTotal;
        const discountAmount = parseFloat(selectedTransaction.discount_amount || 0);

        const totalBeforePenalty = subtotal + transport - discountAmount;
        const pPercent = parseFloat(penaltyPercent || 0);
        const penaltyAmount = totalBeforePenalty * (pPercent / 100);
        const finalTotal = totalBeforePenalty + penaltyAmount;

        router.patch(route('admin.transaction.update', selectedTransaction.id), {
            ...selectedTransaction,
            new_items: realNewItems,
            deleted_items: deletedItems,
            items: selectedTransaction.items,
            penalty_percent: pPercent,
            penalty_amount: penaltyAmount,
            total_price: finalTotal
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsDetailModalOpen(false);
                setNewItems([]);
                setDeletedItems([]);
                setPenaltyPercent(0);
                setToastMessage('Transaksi berhasil diperbarui');
                setShowToast(true);
                setTimeout(() => setShowToast(false), 1500);
            }
        });
    };

    const updateTherapistData = (itemId, data) => {
        router.patch(route('admin.transaction_item.update', itemId), data, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const recalculateCommission = (guestIndex, providedNewItems = null, providedSelectedItems = null) => {
        if (!packages || !selectedTransaction) return;

        const currentNewItems = providedNewItems || newItems;
        const currentSelectedItems = providedSelectedItems || selectedTransaction.items;

        const getCommissionForItem = (item) => {
            // 1. Try matching by package_id first
            if (item.package_id) {
                const pkg = packages.find(p => p.id == item.package_id);
                if (pkg) {
                    let duration = null;
                    if (item.package_duration_id) {
                        duration = (pkg.durations || []).find(d => d.id == item.package_duration_id);
                    }
                    if (!duration && item.package_duration) {
                        duration = (pkg.durations || []).find(d => {
                            return formatDurationLabel(d.duration) === formatDurationLabel(item.package_duration);
                        });
                    }
                    if (!duration && item.price) {
                        duration = (pkg.durations || []).find(d => parseFloat(d.price) === parseFloat(item.price));
                    }
                    if (!duration && item.therapist_commission) {
                        duration = (pkg.durations || []).find(d => parseFloat(d.commission) === parseFloat(item.therapist_commission));
                    }
                    if (!duration && pkg.durations && pkg.durations.length > 0) {
                        duration = pkg.durations[0];
                    }
                    if (duration) {
                        return parseFloat(duration.commission) || 0;
                    }
                }
            }

            // 2. Fallback to name/duration matching
            let pkg = packages.find(p => item.package_name === p.title_id);
            if (!pkg && item.package_name) {
                pkg = [...packages].sort((a, b) => b.title_id.length - a.title_id.length).find(p => String(item.package_name || '').startsWith(p.title_id));
            }

            if (pkg) {
                const duration = (pkg.durations || []).find(d => {
                    return formatDurationLabel(d.duration) === formatDurationLabel(item.package_duration);
                });
                if (duration) {
                    return parseFloat(duration.commission) || 0;
                }
            }
            return parseFloat(item.therapist_commission) || 0;
        };

        const updatedItems = currentSelectedItems.map(it =>
            it.guest_index == guestIndex ? { ...it, therapist_commission: getCommissionForItem(it) } : it
        );
        const updatedNewItems = currentNewItems.map(ni =>
            ni.guest_index == guestIndex ? { ...ni, therapist_commission: getCommissionForItem(ni) } : ni
        );

        setSelectedTransaction({ ...selectedTransaction, items: updatedItems });
        setNewItems(updatedNewItems);

        currentSelectedItems.filter(item => item.guest_index == guestIndex).forEach(item => {
            updateTherapistData(item.id, { therapist_commission: getCommissionForItem(item) });
        });
    };




    const confirmDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
            destroy(route('admin.transaction.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    const formatCurrency = (amount) => {
        const num = Math.round(parseFloat(amount || 0));
        return `Rp ${num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
    };

    const getVoucherNominalDiscount = (transaction) => {
        if (!transaction || !transaction.voucher) return 0;
        if (transaction.voucher.discount_type === 'percent') {
            const subtotal = transaction.items?.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0) || 0;
            return (subtotal * parseFloat(transaction.voucher.discount_amount)) / 100;
        }
        return parseFloat(transaction.voucher.discount_amount);
    };

    const prepareInvoiceMessage = async (transaction, lang = 'id', paymentOptions = { type: 'full', dpAmount: 0 }) => {
        if (!transaction) return '';

        let message = lang === 'en' && app_settings?.template_invoice_en
            ? app_settings.template_invoice_en
            : app_settings?.template_invoice || defaultInvoiceTemplate;

        let linkReview = '';
        if (message.includes('[link_review]')) {
            try {
                const response = await axios.post(route('admin.transaction.review_link', transaction.id));
                if (response.data.success) {
                    linkReview = response.data.link;
                }
            } catch (err) {
                console.error('Failed to generate review link:', err);
            }
        }

        const totalGuests = new Set(transaction.items?.map(item => item.guest_index) || []).size;
        const guestText = lang === 'en'
            ? `Total Guests: ${totalGuests} Person(s)`
            : `Total Pelanggan: ${totalGuests} Orang`;

        const groupedItems = {};
        transaction.items?.forEach(item => {
            const cleanName = cleanPackageName(item.package_name);
            const duration = formatDurationLabel(item.package_duration);
            const key = `${cleanName}___${duration}___${item.price}`;
            if (!groupedItems[key]) {
                groupedItems[key] = {
                    name: cleanName,
                    duration: duration,
                    price: parseFloat(item.price),
                    qty: 0
                };
            }
            groupedItems[key].qty += 1;
        });

        const itemsText = Object.values(groupedItems).map(item => {
            const totalPrice = item.price * item.qty;
            return `  - ${item.name}${item.duration ? ` ${item.duration}` : ''} x ${item.qty} : ${formatPackagePrice(totalPrice)} (@${formatPackagePrice(item.price)})`;
        }).join('\n');

        const detailsText = `${guestText}\nDetail Layanan:\n${itemsText}`;

        const safeOrderNumber = transaction.order_number.replace(/\//g, '-');
        const link = `${window.location.origin}/invoice/${safeOrderNumber}`;

        message = message.replace(/<\/p><p>/g, '\n')
            .replace(/<p>/g, '')
            .replace(/<\/p>/g, '\n')
            .replace(/<strong>/g, '*')
            .replace(/<\/strong>/g, '*')
            .replace(/<br\s*\/?>/g, '\n')
            .replace(/&nbsp;/g, ' ')
            .replace(/<[^>]*>?/gm, '');

        const hasTrailingAsterisk = message.includes('[total]*');
        let totalReplacement = formatCurrency(transaction.total_price);
        if (paymentOptions?.type === 'dp' && (parseFloat(paymentOptions?.dpAmount) || 0) > 0) {
            const dpVal = parseFloat(paymentOptions.dpAmount) || 0;
            const sisaVal = Math.max(0, (parseFloat(transaction.total_price) || 0) - dpVal);
            if (lang === 'en') {
                totalReplacement = hasTrailingAsterisk
                    ? `${formatCurrency(transaction.total_price)}*\n*Payment Type : Down Payment (DP)*\n*DP Amount : ${formatCurrency(dpVal)}*\n*Remaining Balance : ${formatCurrency(sisaVal)} (Paid upon therapist arrival)`
                    : `${formatCurrency(transaction.total_price)}\n*Payment Type : Down Payment (DP)*\n*DP Amount : ${formatCurrency(dpVal)}*\n*Remaining Balance : ${formatCurrency(sisaVal)} (Paid upon therapist arrival)*`;
            } else {
                totalReplacement = hasTrailingAsterisk
                    ? `${formatCurrency(transaction.total_price)}*\n*Tipe Pembayaran : DP (Uang Muka)*\n*Nominal DP : ${formatCurrency(dpVal)}*\n*Sisa Tagihan : ${formatCurrency(sisaVal)} (Dilunasi saat terapis datang)`
                    : `${formatCurrency(transaction.total_price)}\n*Tipe Pembayaran : DP (Uang Muka)*\n*Nominal DP : ${formatCurrency(dpVal)}*\n*Sisa Tagihan : ${formatCurrency(sisaVal)} (Dilunasi saat terapis datang)*`;
            }
        } else {
            if (lang === 'en') {
                totalReplacement = hasTrailingAsterisk
                    ? `${formatCurrency(transaction.total_price)}*\n*Payment Type : Full Payment`
                    : `${formatCurrency(transaction.total_price)}\n*Payment Type : Full Payment*`;
            } else {
                totalReplacement = hasTrailingAsterisk
                    ? `${formatCurrency(transaction.total_price)}*\n*Tipe Pembayaran : Pembayaran Full (Lunas)`
                    : `${formatCurrency(transaction.total_price)}\n*Tipe Pembayaran : Pembayaran Full (Lunas)*`;
            }
        }

        const data = {
            name: transaction.customer_name,
            invoice_no: transaction.order_number,
            details: detailsText,
            transport: formatCurrency(transaction.transport_fee || 0),
            discount: transaction.voucher ? `Voucher ${transaction.voucher.code} : -${formatCurrency(getVoucherNominalDiscount(transaction))}\n` : (transaction.discount_amount > 0 ? `Diskon : -${formatCurrency(transaction.discount_amount)} (${parseFloat(transaction.discount_percent)}%)\n` : ''),
            total: totalReplacement,
            link: link,
            link_review: linkReview
        };

        Object.keys(data).forEach(key => {
            const placeholder = `[${key}]`;
            message = message.split(placeholder).join(data[key] || '');
        });

        return message;
    };

    useEffect(() => {
        if (isInvoiceModalOpen && invoiceTransaction) {
            prepareInvoiceMessage(invoiceTransaction, invoiceLang, {
                type: paymentType,
                dpAmount: paymentType === 'dp' ? dpAmount : 0
            }).then(msg => setPreviewMessage(msg));
        }
    }, [isInvoiceModalOpen, invoiceTransaction, invoiceLang, paymentType, dpAmount]);

    const openInvoiceOptionsModal = (transaction, action = 'send', lang = 'id') => {
        if (!transaction) return;
        setInvoiceTransaction(transaction);
        setInvoiceAction(action);
        setInvoiceLang(lang);
        setPaymentType('full');
        setDpAmount(Math.round((parseFloat(transaction.total_price) || 0) * 0.5)); // default 50%
        setIsInvoiceModalOpen(true);
    };

    const sendInvoice = (transaction) => {
        openInvoiceOptionsModal(transaction, 'send', 'id');
    };

    const copyInvoiceText = (transaction, lang = 'id') => {
        openInvoiceOptionsModal(transaction, 'copy', lang);
    };

    const executeInvoiceAction = async (actionType = invoiceAction) => {
        if (!invoiceTransaction) return;
        const message = await prepareInvoiceMessage(invoiceTransaction, invoiceLang, {
            type: paymentType,
            dpAmount: paymentType === 'dp' ? dpAmount : 0
        });

        if (actionType === 'send') {
            const phone = invoiceTransaction.phone || app_settings?.phone || '';
            if (!phone) {
                alert('Nomor WhatsApp tidak ditemukan.');
                return;
            }
            const encodedMessage = encodeURIComponent(message);
            const cleanPhone = phone.toString().replace(/[^0-9]/g, '');
            let waPhone = cleanPhone;
            if (cleanPhone.startsWith('0')) {
                waPhone = '62' + cleanPhone.substring(1);
            } else if (cleanPhone.startsWith('8')) {
                waPhone = '62' + cleanPhone;
            }
            if (!waPhone) {
                alert('Nomor telepon tidak valid.');
                return;
            }
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const waBaseUrl = isMobile ? 'https://wa.me/' : 'https://web.whatsapp.com/send';
            const finalUrl = isMobile
                ? `${waBaseUrl}${waPhone}?text=${encodedMessage}`
                : `${waBaseUrl}?phone=${waPhone}&text=${encodedMessage}`;

            window.open(finalUrl, '_blank');
            setIsInvoiceModalOpen(false);
        } else {
            navigator.clipboard.writeText(message).then(() => {
                setToastMessage(invoiceLang === 'en' ? 'Teks invoice (EN) berhasil disalin!' : 'Teks invoice berhasil disalin!');
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
                setIsInvoiceModalOpen(false);
            }).catch(err => {
                console.error('Failed to copy: ', err);
                alert('Gagal menyalin teks.');
            });
        }
    };

    const generateReviewLink = async (transaction) => {
        try {
            const response = await axios.post(route('admin.transaction.review_link', transaction.id));
            const data = response.data;

            if (data.success) {
                try {
                    await navigator.clipboard.writeText(data.link);
                    setReviewLinkCopied(transaction.id);
                    setToastMessage('✅ Link review disalin! Berlaku 24 jam.');
                } catch {
                    window.prompt('Salin link review ini (berlaku 24 jam):', data.link);
                    setReviewLinkCopied(transaction.id);
                    setToastMessage('Link review berhasil dibuat!');
                }
                setShowToast(true);
                setTimeout(() => { setReviewLinkCopied(null); setShowToast(false); }, 4000);
            }
        } catch (e) {
            console.error(e);
            alert('Gagal membuat link review: ' + (e?.response?.data?.message || e.message));
        }
    };

    const openDetails = (transaction) => {
        // Recalculate commissions for all items to fix any previously corrupted data
        const enrichedItems = (transaction.items || []).map(item => {
            // 1. Try matching by package_id first
            if (item.package_id) {
                const pkg = packages.find(p => p.id == item.package_id);
                if (pkg) {
                    let duration = null;
                    if (item.package_duration_id) {
                        duration = (pkg.durations || []).find(d => d.id == item.package_duration_id);
                    }
                    if (!duration && item.package_duration) {
                        duration = (pkg.durations || []).find(d => {
                            return formatDurationLabel(d.duration) === formatDurationLabel(item.package_duration);
                        });
                    }
                    if (!duration && item.price) {
                        duration = (pkg.durations || []).find(d => parseFloat(d.price) === parseFloat(item.price));
                    }
                    if (!duration && item.therapist_commission) {
                        duration = (pkg.durations || []).find(d => parseFloat(d.commission) === parseFloat(item.therapist_commission));
                    }
                    if (!duration && pkg.durations && pkg.durations.length > 0) {
                        duration = pkg.durations[0];
                    }
                    if (duration) {
                        return { ...item, therapist_commission: parseFloat(duration.commission) || 0 };
                    }
                }
            }

            // 2. Fallback to name/duration matching
            let pkg = packages.find(p => p.title_id === item.package_name);
            if (!pkg && item.package_name) {
                pkg = [...packages].sort((a, b) => b.title_id.length - a.title_id.length).find(p => String(item.package_name || '').startsWith(p.title_id));
            }
            if (pkg) {
                const duration = (pkg.durations || []).find(d => {
                    return formatDurationLabel(d.duration) === formatDurationLabel(item.package_duration);
                });
                if (duration) {
                    return { ...item, therapist_commission: parseFloat(duration.commission) || 0 };
                }
            }
            return item;
        });

        setSelectedTransaction({ ...transaction, items: enrichedItems });
        setOriginalScheduleDate(transaction.schedule_date);
        setPenaltyPercent(transaction.penalty_percent || 0);
        setNewItems([]);
        setDeletedItems([]);
        setIsDetailModalOpen(true);
    };

    const toggleRow = (id) => {
        setExpandedRows(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Riwayat Transaksi" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* Page Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 px-2 sm:px-0">
                        <div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                PENGGUNA <span className="mx-1">/</span> PESANAN
                            </div>
                            <h2 className="font-bold text-2xl text-gray-900 flex items-center gap-2">
                                <ShoppingCartIcon className="w-6 h-6 text-zenith-orange" />
                                Riwayat Transaksi
                            </h2>
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="mb-6 flex overflow-x-auto pb-2 scrollbar-hide gap-2 px-2 sm:px-0">
                        {[
                            { id: 'all', label: 'Semua', count: counts.all, icon: ShoppingBagIcon },
                            { id: 'recent', label: 'Terbaru (3 Hari)', count: counts.recent, icon: ArrowPathIcon },
                            { id: 'pending', label: 'Pending', count: counts.pending, icon: ArrowPathIcon },
                            { id: 'send_terapis', label: 'Kirim Terapis', count: counts.send_terapis, icon: TruckIcon },
                            { id: 'invoice', label: 'Invoice', count: counts.invoice, icon: DocumentTextIcon },
                            { id: 'success', label: 'Selesai', count: counts.success, icon: CheckCircleIcon },
                            { id: 'failed', label: 'Batal', count: counts.failed, icon: TrashIcon },
                        ].map((tab) => {
                            const isActive = activeTab === tab.id;
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabChange(tab.id)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border ${isActive
                                        ? 'bg-zenith-orange text-white border-zenith-orange shadow-lg shadow-zenith-orange/20'
                                        : 'bg-white text-gray-500 border-gray-100 hover:border-zenith-orange/30 hover:text-zenith-orange'
                                        }`}
                                >
                                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                                    {tab.label}
                                    <span className={`ml-1 px-2 py-0.5 rounded-full text-[9px] ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                        {tab.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Filter & Search */}
                    <div className="bg-white shadow-sm sm:rounded-[2rem] overflow-hidden border border-gray-100 p-4 sm:p-6 mb-6">
                        {/* Row 1: Search + Limit */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                            <div className="flex flex-col sm:flex-row gap-4 flex-1">
                                <div className="relative w-full sm:w-80">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Cari Order ID atau Nama..."
                                        value={search}
                                        onChange={handleSearchChange}
                                        className="pl-11 w-full bg-gray-50 border-transparent focus:bg-white focus:border-zenith-orange focus:ring-zenith-orange rounded-full text-sm py-2.5 transition-colors"
                                    />
                                </div>

                                <div className="relative w-full sm:w-auto flex items-center gap-2">
                                    <div className="w-full sm:w-64">
                                        <ReactSelect
                                            className="text-xs font-semibold text-gray-700 w-full [&_input:focus]:!ring-0 [&_input:focus]:!border-none [&_input]:!border-none [&_input]:!shadow-none"
                                            styles={{
                                                control: (base) => ({
                                                    ...base,
                                                    borderRadius: '9999px',
                                                    borderColor: '#E5E7EB',
                                                    backgroundColor: '#F9FAFB',
                                                    minHeight: '40px',
                                                    boxShadow: 'none',
                                                    '&:hover': { borderColor: '#F97316' }
                                                }),
                                                option: (base, state) => ({
                                                    ...base,
                                                    fontSize: '12px',
                                                    backgroundColor: state.isSelected ? '#F97316' : state.isFocused ? '#FFF7ED' : 'white',
                                                    color: state.isSelected ? 'white' : '#374151'
                                                }),
                                                menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                            }}
                                            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                            menuPosition="fixed"
                                            placeholder="Cari Terapis..."
                                            isClearable
                                            options={[
                                                { value: '', label: 'Semua Terapis' },
                                                { value: 'unassigned', label: '⚠️ Belum Ada Terapis' },
                                                ...employees.map(emp => ({ value: emp.id, label: emp.name }))
                                            ]}
                                            value={[
                                                { value: '', label: 'Semua Terapis' },
                                                { value: 'unassigned', label: '⚠️ Belum Ada Terapis' },
                                                ...employees.map(emp => ({ value: emp.id, label: emp.name }))
                                            ].find(opt => String(opt.value) === String(therapistId || '')) || { value: '', label: 'Semua Terapis' }}
                                            onChange={handleTherapistChange}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setTherapistModalSearch('');
                                            setIsTherapistLinkModalOpen(true);
                                        }}
                                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-zenith-orange/10 text-zenith-orange hover:bg-zenith-orange hover:text-white font-bold text-xs uppercase tracking-wider transition-all border border-zenith-orange/20 shrink-0 shadow-sm"
                                        title="Lihat & Salin Link Profil Terapis"
                                    >
                                        <LinkIcon className="w-4 h-4" />
                                        <span>Profil Terapis</span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <select
                                    value={limit}
                                    onChange={handleLimitChange}
                                    className="bg-transparent border-none text-xs font-bold text-gray-500 focus:ring-0 cursor-pointer"
                                >
                                    <option value="10">10 / PAGE</option>
                                    <option value="25">25 / PAGE</option>
                                    <option value="50">50 / PAGE</option>
                                </select>
                                <div className="text-[10px] font-bold text-gray-700 uppercase tracking-widest">
                                    TOTAL {transactions.total} PESANAN
                                </div>
                            </div>
                        </div>

                        {/* Row 2: Date Range Filter */}
                        <div className="mt-4 pt-4 border-t border-gray-50 flex flex-wrap items-center gap-3">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                Filter Tanggal
                            </span>
                            <div className="flex items-center gap-2 flex-1 flex-wrap">
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={dateFrom}
                                        onChange={handleDateFrom}
                                        className="bg-gray-50 border-transparent focus:border-zenith-orange focus:ring-zenith-orange rounded-xl text-sm py-2 px-4 text-gray-700 cursor-pointer"
                                    />
                                </div>
                                <span className="text-gray-300 font-bold">—</span>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={dateTo}
                                        min={dateFrom || undefined}
                                        onChange={handleDateTo}
                                        className="bg-gray-50 border-transparent focus:border-zenith-orange focus:ring-zenith-orange rounded-xl text-sm py-2 px-4 text-gray-700 cursor-pointer"
                                    />
                                </div>
                                {(dateFrom || dateTo) && (
                                    <button
                                        onClick={clearDateFilter}
                                        className="text-[10px] font-bold text-red-400 hover:text-red-600 uppercase tracking-wider px-3 py-2 rounded-xl hover:bg-red-50 transition-colors"
                                    >
                                        ✕ Reset
                                    </button>
                                )}
                                {(dateFrom || dateTo) && (
                                    <span className="text-[10px] font-bold text-zenith-orange bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
                                        {dateFrom && dateTo
                                            ? `${new Date(dateFrom).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} – ${new Date(dateTo).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`
                                            : dateFrom
                                                ? `Dari ${new Date(dateFrom).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`
                                                : `Sampai ${new Date(dateTo).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`
                                        }
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Transactions Table */}
                    <div className="bg-white shadow-sm sm:rounded-[2rem] overflow-hidden border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order ID</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customer</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Jadwal</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Voucher</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Diskon</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Metode Pembayaran</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {transactions.data.map((transaction) => {
                                        const StatusIcon = statusIcons[transaction.status];
                                        return (
                                            <React.Fragment key={transaction.id}>
                                                <tr className="hover:bg-gray-50/50 transition-colors group">
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-start gap-2">
                                                            <button
                                                                onClick={() => toggleRow(transaction.id)}
                                                                className="mt-0.5 text-gray-400 hover:text-zenith-orange transition-colors"
                                                            >
                                                                {expandedRows[transaction.id] ? (
                                                                    <span className="material-symbols-outlined text-[18px]">keyboard_arrow_up</span>
                                                                ) : (
                                                                    <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
                                                                )}
                                                            </button>
                                                            <div>
                                                                <span className="text-sm font-bold text-gray-900 block">{transaction.order_number}</span>
                                                                <span className="text-[10px] font-medium text-gray-400">{new Date(transaction.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-2">
                                                            <div>
                                                                <span className="text-sm font-semibold text-gray-700 block">{transaction.customer_name}</span>
                                                                <span className="text-[10px] font-medium text-gray-400">{transaction.phone}</span>
                                                            </div>
                                                            {transaction.testimoni && (
                                                                <span
                                                                    title={`Sudah review · ${transaction.testimoni.star}⭐`}
                                                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-600 text-[9px] font-bold uppercase tracking-wider whitespace-nowrap"
                                                                >
                                                                    ⭐ Reviewed
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className="text-sm font-medium text-gray-700 block">{new Date(transaction.schedule_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                                                        <span className="text-[10px] font-bold text-zenith-orange uppercase tracking-wider">{getTransactionTimeRange(transaction)}</span>
                                                    </td>
                                                    <td className="px-6 py-5 text-center">
                                                        {transaction.voucher ? (
                                                            <>
                                                                <span className="text-xs font-bold text-blue-600 block">{transaction.voucher.code}</span>
                                                                <span className="text-[9px] font-medium text-gray-400 uppercase">-{formatCurrency(getVoucherNominalDiscount(transaction))}</span>
                                                            </>
                                                        ) : (
                                                            <span className="text-gray-300">—</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-5 text-center">
                                                        {transaction.discount_percent > 0 ? (
                                                            <>
                                                                <span className="text-xs font-bold text-red-500 block">-{formatCurrency(transaction.discount_amount)}</span>
                                                                <span className="text-[9px] font-medium text-gray-400 uppercase">({parseFloat(transaction.discount_percent)}%)</span>
                                                            </>
                                                        ) : (
                                                            <span className="text-gray-300">—</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-5 text-center">
                                                        <span className="text-xs font-bold text-gray-700 uppercase block">{transaction.payment_method || '-'}</span>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className="text-sm font-bold text-gray-900">{formatCurrency(transaction.total_price)}</span>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex justify-center">
                                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColors[transaction.status]}`}>
                                                                <StatusIcon className="w-3 h-3" />
                                                                {transaction.status.replace('_', ' ')}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => sendInvoice(transaction)}
                                                                className="p-2 text-gray-400 hover:text-green-500 transition-colors"
                                                                title="Kirim Invoice (WA)"
                                                            >
                                                                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => copyInvoiceText(transaction)}
                                                                className="p-2 text-gray-400 hover:text-blue-500 transition-colors flex items-center gap-1"
                                                                title="Copy Text WA (ID)"
                                                            >
                                                                <ClipboardDocumentListIcon className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => copyInvoiceText(transaction, 'en')}
                                                                className="p-2 text-gray-400 hover:text-blue-500 transition-colors flex items-center gap-1"
                                                                title="Copy Text WA (EN)"
                                                            >
                                                                <ClipboardDocumentListIcon className="w-5 h-5" />
                                                                <span className="text-[10px] font-bold">EN</span>
                                                            </button>
                                                            <a
                                                                href={route('admin.transaction.pdf', transaction.id)}
                                                                className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                                                                title="Download PDF"
                                                            >
                                                                <ArrowDownTrayIcon className="w-5 h-5" />
                                                            </a>
                                                            <button
                                                                onClick={() => openDetails(transaction)}
                                                                className="p-2 text-gray-400 hover:text-zenith-orange transition-colors"
                                                                title="Detail"
                                                            >
                                                                <EyeIcon className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => generateReviewLink(transaction)}
                                                                className={`p-2 transition-colors ${reviewLinkCopied === transaction.id ? 'text-amber-500' : 'text-gray-400 hover:text-amber-400'}`}
                                                                title="Generate Link Review (1x24 jam)"
                                                            >
                                                                <StarIcon className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => confirmDelete(transaction.id)}
                                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                                title="Hapus"
                                                            >
                                                                <TrashIcon className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                                {expandedRows[transaction.id] && (
                                                    <tr className="bg-gray-50/30">
                                                        <td colSpan="8" className="px-12 py-4">
                                                            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                                    {Object.entries(
                                                                        transaction.items.reduce((acc, item) => {
                                                                            if (!acc[item.guest_index]) acc[item.guest_index] = [];
                                                                            acc[item.guest_index].push(item);
                                                                            return acc;
                                                                        }, {})
                                                                    ).map(([guestIndex, items]) => {
                                                                        const guestItem = items[0];
                                                                        return (
                                                                            <div key={guestIndex} className="border-l-2 border-zenith-orange/20 pl-4">
                                                                                <div className="flex items-center justify-between mb-2">
                                                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Orang {guestIndex}</p>
                                                                                    <span className="text-[10px] font-bold text-zenith-orange">
                                                                                        {(() => {
                                                                                            const duration = items.reduce((sum, item) => sum + parseInt(item.package_duration || 0), 0);
                                                                                            const startTime = (transaction.schedule_time || '00:00').substring(0, 5).replace('.', ':');
                                                                                            return `${startTime} - ${calculateEndTime(startTime, duration)}`;
                                                                                        })()}
                                                                                    </span>
                                                                                </div>
                                                                                <div className="space-y-1">
                                                                                    {items.map((it, idx) => (
                                                                                        <p key={idx} className="text-xs text-gray-600 font-medium">
                                                                                            • {it.package_name}{(() => { const dl = getItemDurationLabel(it); return dl && !String(it.package_name || '').includes(dl) ? ` ${dl}` : ''; })()}
                                                                                        </p>
                                                                                    ))}
                                                                                    <div className="mt-2 pt-2 border-t border-gray-50">
                                                                                        <p className="text-[11px] font-bold text-green-600 uppercase">
                                                                                            Terapis: {guestItem.employee?.name || 'Belum ditugaskan'}
                                                                                        </p>
                                                                                        <p className="text-[10px] font-bold text-gray-400 uppercase">
                                                                                            Komisi: {formatCurrency(guestItem.therapist_commission || 0)}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                                {(transaction.discount_amount > 0 || transaction.voucher || transaction.penalty_amount > 0) && (
                                                                    <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap gap-4">
                                                                        {transaction.voucher && (
                                                                            <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
                                                                                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Voucher</p>
                                                                                <p className="text-xs font-bold text-blue-600">{transaction.voucher.code} (-{formatCurrency(getVoucherNominalDiscount(transaction))})</p>
                                                                            </div>
                                                                        )}
                                                                        {transaction.discount_percent > 0 && (
                                                                            <div className="bg-red-50 px-4 py-2 rounded-xl border border-red-100">
                                                                                <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Diskon {parseFloat(transaction.discount_percent)}%</p>
                                                                                <p className="text-xs font-bold text-red-600">-{formatCurrency(transaction.discount_amount)}</p>
                                                                            </div>
                                                                        )}
                                                                        {transaction.penalty_amount > 0 && (
                                                                            <div className="bg-orange-50 px-4 py-2 rounded-xl border border-orange-100">
                                                                                <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Reschedule {parseFloat(transaction.penalty_percent)}%</p>
                                                                                <p className="text-xs font-bold text-orange-600">+{formatCurrency(transaction.penalty_amount)}</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                    {transactions.data.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-20 text-center text-gray-400 italic text-sm">
                                                Tidak ada transaksi ditemukan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {transactions.links && transactions.links.length > 3 && (
                            <div className="px-6 py-6 bg-gray-50/50 border-t border-gray-100">
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {transactions.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-4 py-2 text-xs border rounded-xl transition-all shadow-sm ${link.active
                                                ? 'bg-zenith-orange text-white border-zenith-orange shadow-lg shadow-zenith-orange/20'
                                                : link.url
                                                    ? 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                                    : 'bg-white/50 text-gray-400 border-gray-100 cursor-not-allowed'
                                                }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            preserveScroll
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Detail & Update Status Modal */}
            <Modal show={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} maxWidth="2xl">
                <div className="max-h-[90vh] overflow-y-auto custom-scrollbar">
                    <div className="p-8">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">{selectedTransaction?.order_number}</h3>
                                <p className="text-sm text-gray-500">Detail Pesanan & Pembaruan Status</p>
                            </div>
                            <button
                                onClick={() => setIsDetailModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <span className="material-symbols-outlined text-gray-400">close</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            {/* Column Left: Customer & Therapists */}
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Informasi Pelanggan</label>
                                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2">
                                        <div>
                                            <label className="text-[9px] font-bold text-gray-400 uppercase mb-1 block">Nama Customer</label>
                                            <input
                                                type="text"
                                                className="w-full bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-900 px-3 py-2 focus:ring-zenith-orange focus:border-zenith-orange transition-colors"
                                                value={selectedTransaction?.customer_name || ''}
                                                onChange={(e) => setSelectedTransaction({ ...selectedTransaction, customer_name: e.target.value })}
                                                placeholder="Nama customer..."
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-bold text-gray-400 uppercase mb-1 block">Nomor Telepon</label>
                                            <input
                                                type="text"
                                                className="w-full bg-white border border-gray-200 rounded-xl text-sm text-gray-600 px-3 py-2 focus:ring-zenith-orange focus:border-zenith-orange transition-colors"
                                                value={selectedTransaction?.phone || ''}
                                                onChange={(e) => setSelectedTransaction({ ...selectedTransaction, phone: e.target.value })}
                                                placeholder="Nomor telepon..."
                                            />
                                        </div>
                                        <div className="pt-2 border-t border-gray-200">
                                            <label className="text-[9px] font-bold text-gray-400 uppercase mb-1 block">Alamat Pengantaran</label>
                                            <p className="text-xs text-gray-500 leading-relaxed">{selectedTransaction?.address || 'Tidak ada alamat.'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Jadwal</label>
                                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-2">
                                            <input
                                                type="date"
                                                className="w-full bg-transparent border-none p-0 text-xs font-bold text-gray-900 focus:ring-0 cursor-pointer"
                                                value={selectedTransaction?.schedule_date || ''}
                                                onChange={(e) => setSelectedTransaction({ ...selectedTransaction, schedule_date: e.target.value })}
                                            />
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="time"
                                                    className="bg-transparent border-none p-0 text-[10px] text-gray-500 font-medium uppercase focus:ring-0 cursor-pointer"
                                                    value={selectedTransaction?.schedule_time || ''}
                                                    onChange={(e) => setSelectedTransaction({ ...selectedTransaction, schedule_time: e.target.value })}
                                                />
                                                <span className="text-[10px] text-gray-400 font-bold">— {getTransactionTimeRange(selectedTransaction).split(' - ')[1]}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Sumber Order</label>
                                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            <p className="text-xs font-bold text-zenith-orange uppercase">{selectedTransaction?.source || 'POS'}</p>
                                            <p className="text-[10px] text-gray-500 font-medium uppercase mt-0.5">Origin</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Catatan</label>
                                    <p className="text-sm text-gray-600 bg-amber-50 p-4 rounded-2xl border border-amber-100 italic">
                                        {selectedTransaction?.notes || 'Tidak ada catatan.'}
                                    </p>
                                </div>

                            </div>

                            {/* Column Right: Status & Transport Update */}
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Update Status Pesanan</label>
                                    <div className="space-y-2">
                                        {Object.keys(statusColors).map((status) => {
                                            const Icon = statusIcons[status];
                                            const isActive = selectedTransaction?.status === status;
                                            return (
                                                <button
                                                    key={status}
                                                    onClick={() => setSelectedTransaction({ ...selectedTransaction, status })}
                                                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${isActive
                                                        ? `ring-2 ring-offset-1 ${statusColors[status]}`
                                                        : 'bg-white border-gray-200 text-gray-600 hover:border-zenith-orange hover:text-zenith-orange'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Icon className="w-5 h-5" />
                                                        <span className="text-xs font-bold uppercase tracking-wider">{status.replace('_', ' ')}</span>
                                                    </div>
                                                    {isActive && <CheckCircleIcon className="w-5 h-5" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Biaya Transport</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">Rp</span>
                                        <input
                                            type="number"
                                            className="w-full pl-8 bg-gray-50 border-gray-200 rounded-xl text-sm focus:ring-zenith-orange focus:border-zenith-orange"
                                            placeholder="0"
                                            value={selectedTransaction?.transport_fee || ''}
                                            onChange={(e) => setSelectedTransaction({ ...selectedTransaction, transport_fee: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {selectedTransaction?.schedule_date !== originalScheduleDate && (
                                    <div className="animate-fade-in">
                                        <label className="text-[10px] font-bold text-red-500 uppercase tracking-widest block mb-1 flex items-center gap-2">
                                            <span>Penalti Perubahan Tanggal (%)</span>
                                            <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded text-[8px]">DUE TO RESCHEDULE</span>
                                        </label>
                                        <div className="relative">
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">%</span>
                                            <input
                                                type="number"
                                                className="w-full pr-8 bg-red-50 border-red-100 text-red-600 rounded-xl text-sm focus:ring-red-500 focus:border-red-500 font-bold"
                                                placeholder="0"
                                                value={penaltyPercent}
                                                onChange={(e) => setPenaltyPercent(e.target.value)}
                                            />
                                        </div>
                                        <p className="text-[9px] text-gray-400 mt-1 italic leading-tight">
                                            * Penalti akan ditambahkan ke total pembayaran.
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Metode Pembayaran</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <CreditCardIcon className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <select
                                            className="w-full pl-10 bg-gray-50 border-gray-200 rounded-xl text-xs font-bold text-gray-900 uppercase focus:ring-zenith-orange focus:border-zenith-orange cursor-pointer appearance-none"
                                            value={selectedTransaction?.payment_method || 'cash'}
                                            onChange={(e) => setSelectedTransaction({ ...selectedTransaction, payment_method: e.target.value })}
                                        >
                                            <option value="cash">Tunai (Cash)</option>
                                            <option value="transfer">Transfer</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <span className="material-symbols-outlined text-gray-400 text-sm">expand_more</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Grouped Order Items */}
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3">Daftar Paket & Guest</label>
                            <div className="space-y-4">
                                {Object.entries(
                                    [...(selectedTransaction?.items || []), ...newItems].reduce((acc, item) => {
                                        const gIdx = item.guest_index || 1;
                                        if (!acc[gIdx]) acc[gIdx] = [];
                                        acc[gIdx].push(item);
                                        return acc;
                                    }, {})
                                ).map(([guestIndex, items]) => (
                                    <div key={guestIndex} className="bg-white border border-gray-100 rounded-2xl overflow-x-auto shadow-sm">
                                        <div className="bg-gray-50/50 px-4 py-3 border-b border-gray-100 flex flex-wrap gap-4 justify-between items-center">
                                            <div className="flex-col w-full md:flex-row flex md:items-center md:justify-between gap-4">
                                                <div>
                                                    <span className="text-xs font-bold text-gray-700 block">Customer ke-{guestIndex}</span>
                                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                                                        {(() => {
                                                            const existingDuration = items.filter(it => !it.isNew).reduce((sum, item) => sum + parseInt(item.package_duration || 0), 0);
                                                            const newDuration = items.filter(it => it.isNew).reduce((sum, item) => sum + parseInt(item.package_duration || 0), 0);
                                                            const totalDuration = existingDuration + newDuration;
                                                            const startTime = (selectedTransaction.schedule_time || '00:00').substring(0, 5).replace('.', ':');
                                                            return `${startTime} - ${calculateEndTime(startTime, totalDuration)}`;
                                                        })()}
                                                    </span>
                                                </div>

                                                {/* Therapist Selector Integrated */}
                                                <div className="flex-col md:flex-row flex md:items-center gap-2 md:border-l md:border-gray-200 md:pl-4 pl-0 w-full">
                                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Terapis:</span>
                                                    <ReactSelect
                                                        className="text-[10px] font-bold text-gray-600 min-w-[150px] flex-1 [&_input:focus]:!ring-0 [&_input:focus]:!border-none [&_input]:!border-none [&_input]:!shadow-none"
                                                        styles={{
                                                            control: (base) => ({
                                                                ...base,
                                                                borderRadius: '0.75rem',
                                                                borderColor: '#e5e7eb',
                                                                minHeight: '34px',
                                                                boxShadow: 'none',
                                                                '&:hover': { borderColor: '#F97316' }
                                                            }),
                                                            option: (base) => ({ ...base, fontSize: '12px' }),
                                                            menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                                        }}
                                                        menuPortalTarget={document.body}
                                                        menuPosition="fixed"
                                                        placeholder="Pilih Terapis..."
                                                        options={employees.map(emp => ({ value: emp.id, label: emp.name }))}
                                                        value={employees.filter(emp => emp.id == (items[0]?.employee_id || '')).map(emp => ({ value: emp.id, label: emp.name }))[0] || null}
                                                        onChange={(selectedOption) => {
                                                            const newId = selectedOption ? selectedOption.value : '';
                                                            const selectedEmp = employees.find(emp => emp.id == newId);

                                                            const updatedItems = selectedTransaction.items.map(it =>
                                                                it.guest_index == guestIndex ? { ...it, employee_id: newId, employee: selectedEmp } : it
                                                            );
                                                            setSelectedTransaction({ ...selectedTransaction, items: updatedItems });

                                                            setNewItems(newItems.map(ni =>
                                                                ni.guest_index == guestIndex ? { ...ni, employee_id: newId } : ni
                                                            ));
                                                        }}
                                                        isClearable
                                                        isSearchable
                                                    />

                                                    {/* Auto-computed commission badge for this guest */}
                                                    <div className="bg-gray-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                                                        <span className="text-[8px] text-gray-400 font-bold uppercase">Komisi</span>
                                                        <span className="text-[10px] font-black text-gray-700">
                                                            {formatCurrency(
                                                                items.reduce((sum, it) => sum + (parseFloat(it.therapist_commission) || 0), 0)
                                                            )}
                                                        </span>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => recalculateCommission(guestIndex)}
                                                        className="p-1.5 hover:bg-zenith-orange/10 rounded-lg transition-colors group/btn border border-gray-200 bg-white"
                                                        title="Reset Komisi ke Default Paket"
                                                    >
                                                        <ArrowPathIcon className="w-3 h-3 text-gray-400 group-hover/btn:text-zenith-orange" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="gap-2">
                                                <div className="relative">
                                                    <ReactSelect
                                                        className="min-w-[200px] [&_input:focus]:!ring-0 [&_input:focus]:!border-none [&_input]:!border-none [&_input]:!shadow-none"
                                                        styles={{
                                                            control: (base) => ({
                                                                ...base,
                                                                backgroundColor: 'rgba(249, 115, 22, 0.1)',
                                                                border: 'none',
                                                                borderRadius: '9999px',
                                                                minHeight: '28px',
                                                                fontSize: '9px',
                                                                fontWeight: 'bold',
                                                                textTransform: 'uppercase',
                                                                color: '#F97316',
                                                                boxShadow: 'none'
                                                            }),
                                                            placeholder: (base) => ({ ...base, color: '#F97316' }),
                                                            singleValue: (base) => ({ ...base, color: '#F97316' }),
                                                            option: (base) => ({ ...base, fontSize: '12px', textTransform: 'none' }),
                                                            menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                                        }}
                                                        menuPortalTarget={document.body}
                                                        menuPosition="fixed"
                                                        placeholder="+ Tambah Paket"
                                                        options={packages.filter(p => !p.is_signature).map(pkg => ({
                                                            label: pkg.title_id,
                                                            options: (pkg.durations || []).map((dur, dIdx) => ({
                                                                value: `${pkg.id}|${dIdx}`,
                                                                label: `${pkg.title_id} ${formatDurationLabel(dur.duration)}`
                                                            }))
                                                        }))}
                                                        value={null}
                                                        onChange={(selectedOption) => {
                                                            if (!selectedOption) return;
                                                            const [pkgId, durIdx] = selectedOption.value.split('|');
                                                            const pkg = packages.find(p => p.id == pkgId);
                                                            const duration = (pkg?.durations || [])[durIdx];
                                                            if (!duration) return;

                                                            const currentTherapistId = items[0]?.employee_id || '';

                                                            const newItem = {
                                                                guest_index: parseInt(guestIndex),
                                                                package_id: pkg.id,
                                                                package_duration_id: duration.id,
                                                                package_name: `${pkg.title_id} ${formatDurationLabel(duration.duration)}`.trim(),
                                                                package_duration: duration.duration,
                                                                price: parseFloat(duration.price),
                                                                therapist_commission: parseFloat(duration.commission),
                                                                employee_id: currentTherapistId,
                                                                guest_gender: items[0]?.guest_gender || 'wanita',
                                                                isNew: true,
                                                                tempId: Date.now() + Math.random()
                                                            };

                                                            // Remove any placeholder item for this guest before adding the real item
                                                            const filteredNewItems = newItems.filter(ni => !(ni.guest_index == guestIndex && ni.isPlaceholder));
                                                            recalculateCommission(guestIndex, [...filteredNewItems, newItem], selectedTransaction.items);
                                                        }}
                                                        isSearchable
                                                    />
                                                    {/* <PlusIcon className="w-3 h-3 text-zenith-orange absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" /> */}
                                                </div>
                                                <span className="text-[10px] font-bold text-zenith-orange uppercase">Pelanggan Request : {items[0]?.guest_gender}</span>
                                                {/* Remove entire new guest group */}
                                                {items.every(it => it.isNew) && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setNewItems(newItems.filter(ni => ni.guest_index != guestIndex));
                                                        }}
                                                        className="flex items-center gap-1 text-[9px] font-bold text-red-400 hover:text-red-600 uppercase tracking-wider px-2 py-1 rounded-lg hover:bg-red-50 transition-colors border border-red-200 hover:border-red-300 whitespace-nowrap"
                                                        title="Hapus customer baru ini"
                                                    >
                                                        <XMarkIcon className="w-3 h-3" />
                                                        Hapus Customer
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div class="overflow-auto overflow-x-auto">
                                            <table className="w-full text-left text-sm">
                                                <thead>
                                                    <tr className="border-b border-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                        <th className="px-4 py-2">Paket</th>
                                                        <th className="px-4 py-2 text-right">Komisi</th>
                                                        <th className="px-4 py-2 text-right">Harga</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {items.filter(item => !item.isPlaceholder).map((item, idx) => (
                                                        <tr key={idx} className={item.isNew ? 'bg-green-50/30' : ''}>
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center gap-2">
                                                                    {item.isNew && <span className="bg-green-100 text-green-600 px-1.5 py-0.5 rounded text-[8px] font-black uppercase shrink-0">BARU</span>}
                                                                    <ReactSelect
                                                                        className="w-full min-w-[180px] sm:min-w-[220px] [&_input:focus]:!ring-0 [&_input:focus]:!border-none [&_input]:!border-none [&_input]:!shadow-none"
                                                                        styles={{
                                                                            control: (base) => ({
                                                                                ...base,
                                                                                borderRadius: '0.5rem',
                                                                                borderColor: '#f3f4f6', // subtle border
                                                                                backgroundColor: '#ffffff',
                                                                                minHeight: '32px',
                                                                                boxShadow: 'none',
                                                                                '&:hover': { borderColor: '#d1d5db' }
                                                                            }),
                                                                            singleValue: (base) => ({
                                                                                ...base,
                                                                                fontSize: '13px',
                                                                                fontWeight: 600,
                                                                                color: '#374151'
                                                                            }),
                                                                            option: (base) => ({ ...base, fontSize: '12px' }),
                                                                            menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                                                        }}
                                                                        menuPortalTarget={document.body}
                                                                        menuPosition="fixed"
                                                                        options={packages.filter(p => !p.is_signature).map(pkg => ({
                                                                            label: pkg.title_id,
                                                                            options: (pkg.durations || []).map((dur, dIdx) => ({
                                                                                value: `${pkg.id}|${dIdx}`,
                                                                                label: `${pkg.title_id} ${formatDurationLabel(dur.duration)}`
                                                                            }))
                                                                        }))}
                                                                        value={{
                                                                            value: getItemSelectValue(item),
                                                                            label: getItemSelectLabel(item)
                                                                        }}
                                                                        onChange={(selectedOption) => {
                                                                            if (!selectedOption) return;
                                                                            const [pkgId, durIdx] = selectedOption.value.split('|');
                                                                            const pkg = packages.find(p => p.id == pkgId);
                                                                            const duration = (pkg?.durations || [])[durIdx];
                                                                            if (!duration) return;

                                                                            let nextNewItems = newItems;
                                                                            let nextSelectedItems = selectedTransaction.items;

                                                                            if (item.isNew) {
                                                                                nextNewItems = newItems.map(ni =>
                                                                                    ni.tempId === item.tempId
                                                                                        ? { ...ni, package_id: pkg.id, package_duration_id: duration.id, package_name: `${pkg.title_id} ${formatDurationLabel(duration.duration)}`.trim(), package_duration: duration.duration, price: parseFloat(duration.price), therapist_commission: parseFloat(duration.commission) }
                                                                                        : ni
                                                                                );
                                                                            } else {
                                                                                nextSelectedItems = selectedTransaction.items.map(it =>
                                                                                    it.id === item.id
                                                                                        ? { ...it, package_id: pkg.id, package_duration_id: duration.id, package_name: `${pkg.title_id} ${formatDurationLabel(duration.duration)}`.trim(), package_duration: duration.duration, price: parseFloat(duration.price), therapist_commission: parseFloat(duration.commission) }
                                                                                        : it
                                                                                );
                                                                            }
                                                                            recalculateCommission(item.guest_index || guestIndex, nextNewItems, nextSelectedItems);
                                                                        }}
                                                                        isSearchable
                                                                    />
                                                                    {!item.isNew && (
                                                                        pendingDeleteItemId === item.id ? (
                                                                            <div className="flex items-center gap-1">
                                                                                <button
                                                                                    onClick={() => {
                                                                                        setDeletedItems([...deletedItems, item.id]);
                                                                                        const updatedItems = selectedTransaction.items.filter(it => it.id !== item.id);
                                                                                        recalculateCommission(item.guest_index || guestIndex, newItems, updatedItems);
                                                                                        setPendingDeleteItemId(null);
                                                                                    }}
                                                                                    className="text-[9px] font-black text-white bg-red-500 hover:bg-red-600 px-2 py-0.5 rounded-full transition-colors"
                                                                                >
                                                                                    Hapus?
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => setPendingDeleteItemId(null)}
                                                                                    className="text-[9px] font-black text-gray-400 hover:text-gray-600 px-2 py-0.5 rounded-full border border-gray-200 transition-colors"
                                                                                >
                                                                                    Batal
                                                                                </button>
                                                                            </div>
                                                                        ) : (
                                                                            <button
                                                                                onClick={() => setPendingDeleteItemId(item.id)}
                                                                                className="text-red-300 hover:text-red-500 transition-colors ml-1"
                                                                                title="Hapus paket"
                                                                            >
                                                                                <XMarkIcon className="w-3.5 h-3.5" />
                                                                            </button>
                                                                        )
                                                                    )}
                                                                    {item.isNew && (
                                                                        <button
                                                                            onClick={() => {
                                                                                const nextNewItems = newItems.filter(ni => ni.tempId !== item.tempId);
                                                                                recalculateCommission(item.guest_index || guestIndex, nextNewItems, selectedTransaction.items);
                                                                            }}
                                                                            className="text-red-400 hover:text-red-600 transition-colors ml-1"
                                                                        >
                                                                            <XMarkIcon className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                <div className="mt-1 flex items-center gap-2">
                                                                    <span className="text-[10px] font-bold text-green-600 uppercase tracking-tight">Terapis:</span>
                                                                    <span className="text-[10px] font-medium text-gray-500 uppercase">{item.employee?.name || employees.find(e => e.id == item.employee_id)?.name || 'Belum dipilih'}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 text-right text-[11px] font-bold text-gray-400">
                                                                {formatCurrency(item.therapist_commission || 0)}
                                                            </td>
                                                            <td className="px-4 py-3 text-right font-bold text-gray-900">
                                                                {formatCurrency(item.price)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))}

                                {/* Add New Customer (Guest) Button */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        const allItems = [...(selectedTransaction?.items || []), ...newItems];
                                        const maxGuestIdx = allItems.reduce((max, it) => Math.max(max, parseInt(it.guest_index || 1)), 0);
                                        const nextGuestIndex = maxGuestIdx + 1;
                                        // Add a placeholder new item for the new guest so it shows up
                                        const placeholderItem = {
                                            guest_index: nextGuestIndex,
                                            package_name: '',
                                            package_duration: '',
                                            price: 0,
                                            therapist_commission: 0,
                                            employee_id: '',
                                            guest_gender: 'wanita',
                                            isNew: true,
                                            isPlaceholder: true,
                                            tempId: Date.now() + Math.random()
                                        };
                                        setNewItems([...newItems, placeholderItem]);
                                    }}
                                    className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-zenith-orange/30 hover:border-zenith-orange/60 text-zenith-orange/60 hover:text-zenith-orange rounded-2xl py-3 text-[11px] font-bold uppercase tracking-widest transition-all hover:bg-zenith-orange/5"
                                >
                                    <PlusIcon className="w-4 h-4" />
                                    Tambah Customer Baru
                                </button>

                                <div className="bg-zenith-orange/5 p-6 rounded-2xl border border-zenith-orange/10 mt-6">
                                    <div className="flex justify-between items-start md:flex-row flex-col gap-6">
                                        <div className="flex-1 w-full">
                                            <span className="text-sm font-bold text-gray-500 uppercase tracking-widest block mb-3">Ringkasan Komisi</span>
                                            <div className="space-y-2">
                                                {(() => {
                                                    const allItems = [...(selectedTransaction?.items || []), ...newItems];
                                                    // Group by guest_index
                                                    const byGuest = allItems.reduce((acc, item) => {
                                                        const g = item.guest_index || 1;
                                                        if (!acc[g]) acc[g] = { items: [], employee_id: item.employee_id, employee: item.employee };
                                                        acc[g].items.push(item);
                                                        return acc;
                                                    }, {});

                                                    return Object.entries(byGuest).map(([gIdx, data]) => {
                                                        const therapistName = data.employee?.name ||
                                                            employees.find(e => e.id == data.employee_id)?.name ||
                                                            'Belum dipilih';
                                                        const totalKomisi = data.items.reduce((s, it) => s + (parseFloat(it.therapist_commission) || 0), 0);
                                                        return (
                                                            <div key={gIdx} className="flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-gray-100">
                                                                <div className="flex flex-col">
                                                                    <span className="text-[9px] font-bold text-zenith-orange uppercase tracking-widest">Terapis ke-{gIdx}</span>
                                                                    <span className="text-xs font-bold text-gray-700 uppercase">{therapistName}</span>
                                                                </div>
                                                                <span className="text-xs font-black text-gray-900">{formatCurrency(totalKomisi)}</span>
                                                            </div>
                                                        );
                                                    });
                                                })()}

                                                {/* Grand total commission */}
                                                <div className="flex items-center justify-between pt-2 border-t border-zenith-orange/20">
                                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Komisi</span>
                                                    <span className="text-sm font-black text-gray-900">
                                                        {formatCurrency(
                                                            [...(selectedTransaction?.items || []), ...newItems].reduce((s, it) => s + (parseFloat(it.therapist_commission) || 0), 0)
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right ml-0 md:ml-8 w-full md:w-auto">
                                            <span className="text-sm font-bold text-gray-500 uppercase tracking-widest block mb-1">Grand Total</span>
                                            <span className="text-2xl font-black text-zenith-orange">
                                                {formatCurrency(
                                                    ([...(selectedTransaction?.items || []), ...newItems].reduce((sum, item) => sum + parseFloat(item.price), 0)) +
                                                    parseFloat(selectedTransaction?.transport_fee || 0) -
                                                    (selectedTransaction?.discount_amount || 0) +
                                                    ((([...(selectedTransaction?.items || []), ...newItems].reduce((sum, item) => sum + parseFloat(item.price), 0)) +
                                                        parseFloat(selectedTransaction?.transport_fee || 0) -
                                                        (selectedTransaction?.discount_amount || 0)) * (penaltyPercent / 100))
                                                )}
                                            </span>
                                            <div className="flex flex-col items-end gap-1 mt-1">
                                                {selectedTransaction?.transport_fee > 0 && (
                                                    <p className="text-[10px] text-gray-400 font-medium">
                                                        Sudah termasuk Biaya Transport {formatCurrency(selectedTransaction.transport_fee)}
                                                    </p>
                                                )}
                                                {selectedTransaction?.voucher && (
                                                    <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">
                                                        Voucher: {selectedTransaction.voucher.code} (-{formatCurrency(getVoucherNominalDiscount(selectedTransaction))})
                                                    </p>
                                                )}
                                                {selectedTransaction?.discount_percent > 0 && (
                                                    <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider">
                                                        Potongan Diskon {parseFloat(selectedTransaction.discount_percent)}% ({formatCurrency(selectedTransaction.discount_amount)})
                                                    </p>
                                                )}
                                                {penaltyPercent > 0 && (
                                                    <p className="text-[10px] text-red-600 font-bold uppercase tracking-wider">
                                                        Penalti Perubahan Tanggal {penaltyPercent}% ({formatCurrency(
                                                            ((([...(selectedTransaction?.items || []), ...newItems].reduce((sum, item) => sum + parseFloat(item.price), 0)) +
                                                                parseFloat(selectedTransaction?.transport_fee || 0) -
                                                                (selectedTransaction?.discount_amount || 0)) * (penaltyPercent / 100))
                                                        )})
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-wrap justify-between items-center gap-3 pt-6 border-t border-gray-100">
                            {/* Left: Action buttons */}
                            <div className="flex flex-wrap gap-2">
                                <a
                                    href={route('admin.transaction.pdf', selectedTransaction?.id || 0)}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-900 border border-transparent rounded-full font-bold text-[10px] text-white uppercase tracking-widest transition-all"
                                >
                                    <ArrowDownTrayIcon className="w-4 h-4" />
                                    PDF
                                </a>
                                <PrimaryButton
                                    onClick={() => sendInvoice(selectedTransaction)}
                                    className="bg-green-600 hover:bg-green-700 border-green-600 inline-flex items-center gap-2 whitespace-nowrap"
                                >
                                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                                    Kirim WA
                                </PrimaryButton>
                                <PrimaryButton
                                    onClick={() => copyInvoiceText(selectedTransaction)}
                                    className="bg-blue-500 hover:bg-blue-600 border-blue-500 inline-flex items-center gap-2 whitespace-nowrap"
                                >
                                    <ClipboardDocumentListIcon className="w-4 h-4" />
                                    Copy Text (ID)
                                </PrimaryButton>
                                <PrimaryButton
                                    onClick={() => copyInvoiceText(selectedTransaction, 'en')}
                                    className="bg-blue-500 hover:bg-blue-600 border-blue-500 inline-flex items-center gap-2 whitespace-nowrap"
                                >
                                    <ClipboardDocumentListIcon className="w-4 h-4" />
                                    Copy Text (EN)
                                </PrimaryButton>
                            </div>

                            {/* Right: PDF + Cancel */}
                            <div className="flex items-center gap-2">

                                <PrimaryButton
                                    onClick={saveTransaction}
                                    className="bg-zenith-orange hover:bg-zenith-orange/90 shadow-lg shadow-zenith-orange/20 inline-flex items-center gap-2 whitespace-nowrap"
                                >
                                    <span className="material-symbols-outlined text-[16px]">save</span>
                                    Simpan Perubahan
                                </PrimaryButton>
                                <SecondaryButton onClick={() => setIsDetailModalOpen(false)}>
                                    Batal
                                </SecondaryButton>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Modal Pilihan Pengiriman Invoice */}
            <Modal show={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} maxWidth="lg">
                <div className="max-h-[90vh] overflow-y-auto custom-scrollbar p-6 sm:p-8">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-50 rounded-2xl border border-green-100">
                                <ChatBubbleLeftRightIcon className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Opsi Pengiriman Invoice</h3>
                                <p className="text-xs text-gray-500 font-medium">
                                    {invoiceTransaction?.order_number} · <span className="text-gray-700 font-bold">{invoiceTransaction?.customer_name}</span>
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsInvoiceModalOpen(false)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* 1. Pilih Bahasa */}
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                                Bahasa Invoice / Language
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setInvoiceLang('id')}
                                    className={`py-2.5 px-4 rounded-xl font-bold text-xs border transition-all flex items-center justify-center gap-2 ${invoiceLang === 'id'
                                        ? 'bg-zenith-orange text-white border-zenith-orange shadow-md shadow-zenith-orange/20'
                                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                        }`}
                                >
                                    <span>🇮🇩</span> Indonesia (ID)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setInvoiceLang('en')}
                                    className={`py-2.5 px-4 rounded-xl font-bold text-xs border transition-all flex items-center justify-center gap-2 ${invoiceLang === 'en'
                                        ? 'bg-zenith-orange text-white border-zenith-orange shadow-md shadow-zenith-orange/20'
                                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                        }`}
                                >
                                    <span>🇬🇧</span> English (EN)
                                </button>
                            </div>
                        </div>

                        {/* 2. Pilih Tipe Pembayaran */}
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                                Tipe Pembayaran
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setPaymentType('full')}
                                    className={`p-3 rounded-2xl font-bold text-xs border text-left transition-all ${paymentType === 'full'
                                        ? 'bg-orange-50/80 text-zenith-orange border-zenith-orange ring-1 ring-zenith-orange'
                                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-black">Pembayaran Full</span>
                                        {paymentType === 'full' && <span className="w-2 h-2 rounded-full bg-zenith-orange"></span>}
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-normal">Tagihan penuh sejumlah total pesanan</p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPaymentType('dp')}
                                    className={`p-3 rounded-2xl font-bold text-xs border text-left transition-all ${paymentType === 'dp'
                                        ? 'bg-orange-50/80 text-zenith-orange border-zenith-orange ring-1 ring-zenith-orange'
                                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-black">Pembayaran DP</span>
                                        {paymentType === 'dp' && <span className="w-2 h-2 rounded-full bg-zenith-orange"></span>}
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-normal">Tagihan uang muka dan sisa pelunasan</p>
                                </button>
                            </div>
                        </div>

                        {/* 3. Input Nominal DP (Jika DP dipilih) */}
                        {paymentType === 'dp' && (
                            <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100 space-y-3 animate-fade-in">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-bold text-gray-800">Nominal DP (Uang Muka)</label>
                                    <span className="text-[10px] font-bold text-zenith-orange uppercase tracking-wider">
                                        Total: {formatCurrency(invoiceTransaction?.total_price || 0)}
                                    </span>
                                </div>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-sm font-bold text-gray-400">Rp</span>
                                    <input
                                        type="number"
                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-orange-200 rounded-xl text-sm font-bold text-gray-900 focus:ring-zenith-orange focus:border-zenith-orange"
                                        value={dpAmount}
                                        onChange={(e) => setDpAmount(e.target.value)}
                                        placeholder="0"
                                    />
                                </div>
                                {/* Quick Percentage Buttons */}
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {[0.2, 0.3, 0.5, 0.7].map((pct) => {
                                        const calcVal = Math.round((parseFloat(invoiceTransaction?.total_price) || 0) * pct);
                                        const isSelected = parseFloat(dpAmount) === calcVal;
                                        return (
                                            <button
                                                key={pct}
                                                type="button"
                                                onClick={() => setDpAmount(calcVal)}
                                                className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-colors ${isSelected
                                                    ? 'bg-zenith-orange text-white border-zenith-orange'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-zenith-orange hover:text-zenith-orange'
                                                    }`}
                                            >
                                                {pct * 100}% ({formatCurrency(calcVal)})
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="pt-2 border-t border-orange-100/80 flex justify-between items-center text-xs">
                                    <span className="text-gray-600 font-medium">Sisa Pelunasan (Saat Terapis Datang):</span>
                                    <span className="font-bold text-red-600">
                                        {formatCurrency(Math.max(0, (parseFloat(invoiceTransaction?.total_price) || 0) - (parseFloat(dpAmount) || 0)))}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* 4. Live Preview Teks WhatsApp */}
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                                Pratinjau Teks WhatsApp (Live Preview)
                            </label>
                            <div className="bg-gray-900 text-gray-100 p-4 rounded-2xl text-xs font-mono whitespace-pre-wrap max-h-52 overflow-y-auto border border-gray-800 custom-scrollbar leading-relaxed">
                                {previewMessage || 'Memuat pratinjau...'}
                            </div>
                        </div>
                    </div>

                </div>
                {/* Tombol Aksi Modal */}
                <div className="px-4 sm:px-8 pb-4 sm:pb-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3 justify-end">
                    <SecondaryButton
                        onClick={() => setIsInvoiceModalOpen(false)}
                        className="justify-center py-3 rounded-xl"
                    >
                        Batal
                    </SecondaryButton>
                    <button
                        type="button"
                        onClick={() => {
                            setInvoiceAction('copy');
                            executeInvoiceAction('copy');
                        }}
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-500/20"
                    >
                        <ClipboardDocumentListIcon className="w-4 h-4" />
                        Salin Teks Invoice
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setInvoiceAction('send');
                            executeInvoiceAction('send');
                        }}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-green-500/20"
                    >
                        <ChatBubbleLeftRightIcon className="w-4 h-4" />
                        Kirim ke WhatsApp
                    </button>
                </div>
            </Modal>

            {/* Modal Link Profil Terapis */}
            <Modal show={isTherapistLinkModalOpen} onClose={() => setIsTherapistLinkModalOpen(false)} maxWidth="2xl">
                <div className="p-6">
                    <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-zenith-orange/10 flex items-center justify-center text-zenith-orange">
                                <LinkIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">Link Profil Terapis</h3>
                                <p className="text-xs text-gray-500">Salin tautan kartu identitas digital terapis untuk dikirim ke pelanggan</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsTherapistLinkModalOpen(false)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="mt-4">
                        <div className="relative mb-4">
                            <input
                                type="text"
                                placeholder="Cari nama terapis..."
                                value={therapistModalSearch}
                                onChange={(e) => setTherapistModalSearch(e.target.value)}
                                className="w-full bg-gray-50 border-gray-200 focus:bg-white focus:border-zenith-orange focus:ring-zenith-orange rounded-xl text-sm py-2 px-3 transition-colors"
                            />
                        </div>

                        <div className="max-h-[55vh] overflow-y-auto pr-1 space-y-2.5">
                            {employees
                                .filter(emp => {
                                    const q = therapistModalSearch.toLowerCase();
                                    return (
                                        (emp.name && emp.name.toLowerCase().includes(q)) ||
                                        (emp.fullname && emp.fullname.toLowerCase().includes(q)) ||
                                        (emp.nip && emp.nip.toLowerCase().includes(q))
                                    );
                                })
                                .map((emp) => {
                                    const publicUrl = `${window.location.origin}/kartu/karyawan/${emp.nip || emp.id}`;
                                    return (
                                        <div
                                            key={emp.id}
                                            className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-zenith-orange/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                        >
                                            <div className="flex items-center gap-3">
                                                {emp.photo ? (
                                                    <img
                                                        src={`/storage/${emp.photo}`}
                                                        alt={emp.name}
                                                        className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-zenith-orange/10 flex items-center justify-center text-zenith-orange shrink-0 font-bold text-sm">
                                                        {emp.name?.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-bold text-sm text-gray-900">
                                                        {emp.fullname || emp.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 flex items-center gap-1.5">
                                                        <span>Panggilan: <strong className="text-gray-700">{emp.name}</strong></span>
                                                        <span>•</span>
                                                        <span>ID: #{emp.nip || emp.id}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 self-end sm:self-center">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(publicUrl);
                                                        setToastMessage(`✅ Link profil ${emp.name} berhasil disalin!`);
                                                        setShowToast(true);
                                                        setTimeout(() => setShowToast(false), 2500);
                                                    }}
                                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:border-zenith-orange hover:text-zenith-orange font-bold text-xs transition-all shadow-sm"
                                                >
                                                    <LinkIcon className="w-3.5 h-3.5" />
                                                    <span>Salin Link</span>
                                                </button>
                                                <a
                                                    href={publicUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zenith-orange/10 text-zenith-orange hover:bg-zenith-orange hover:text-white font-bold text-xs transition-all"
                                                    title="Buka Profil"
                                                >
                                                    <EyeIcon className="w-3.5 h-3.5" />
                                                </a>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed bottom-10 right-10 z-[110] animate-slide-up">
                    <div className="bg-gray-900 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-x-4 border border-white/10">
                        <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                            <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                            <p className="text-sm font-bold">Berhasil!</p>
                            <p className="text-xs text-gray-400">{toastMessage}</p>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
