import { useRef, useState } from 'react';
import { Download, MessageSquare, Smartphone, X } from 'lucide-react';
import { useUI } from '../context/UIContext';
import { useDialogFocus } from './studio/AssetPickerModal';

const steps = [
  ['1. Pilih layar', 'Di daftar Slide, pilih Tambah slide lalu tentukan aplikasi dan adegannya. Pengaturan HP mengubah perangkat serta tema layar.', Smartphone],
  ['2. Isi ceritamu', 'Gunakan Coba layar HP untuk mengetik dan mengirim konten cerita. Pilih Ubah isi lalu ketuk elemen untuk membuka pengaturannya.', MessageSquare],
  ['3. Simpan dan bagikan', 'Lanjutkan ke slide baru membuat salinan adegan. Pilih Unduh gambar untuk PNG atau semua slide dalam ZIP.', Download]
];
export default function Onboarding({ onClose }) {
  const { t } = useUI(), dialog = useRef(null);
  const [step, setStep] = useState(0);
  useDialogFocus(dialog, onClose);
  const [title, detail, Icon] = steps[step];
  return <div className="dialog-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section ref={dialog} className="onboarding-dialog" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <div className="dialog-heading"><span>{t('Panduan pertama')}</span><button className="icon-button" aria-label={t('Tutup')} onClick={onClose}><X size={19} /></button></div>
      <div key={step} className="onboarding-content"><span className="guide-illustration" aria-hidden="true"><Icon size={42} strokeWidth={1.3} /></span>
        <p className="field-hint">{t('Langkah {n} dari 3', { n: step + 1 })}</p><h2 id="onboarding-title">{t(title)}</h2><p>{t(detail)}</p>
        <div className="guide-progress" aria-hidden="true">{steps.map((_, index) => <span key={index} className={index === step ? 'active' : ''} />)}</div>
        <p className="field-hint">{t('Buka panduan lagi kapan pun melalui Bantuan.')}</p>
      </div><div className="dialog-footer"><button className="text-button" onClick={onClose}>{t('Lewati panduan')}</button><button className="button primary" onClick={() => step === 2 ? onClose() : setStep(step + 1)}>{t(step === 2 ? 'Mulai menulis' : 'Berikutnya')}</button></div>
    </section>
  </div>;
}
