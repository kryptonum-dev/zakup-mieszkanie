import { useState, useEffect } from 'preact/hooks';
import { useForm, type FieldValues, type SubmitHandler } from 'react-hook-form';
import styles from './Form.module.scss';
import Input from '@components/ui/Input'
import Checkbox from '@components/ui/Checkbox'
import Button from '@components/ui/Button'
import { REGEX } from '@global/constants';
import { sendContactEmail, type Props as sendContactEmailProps } from '@api/contact/sendContactEmail';
import { trackEvent } from '@api/analytics/track-event';

type Props = {
  children: React.ReactNode,
} & React.FormHTMLAttributes<HTMLFormElement>

export default function Form({ children, ...props }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ mode: 'onTouched' });

  useEffect(() => {
    const tryAgain = () => setStatus('idle');
    document.addEventListener('Contact-TryAgain', tryAgain);
    return () => document.removeEventListener('Contact-TryAgain', tryAgain);
  }, []);

  const onSubmit = async (data: sendContactEmailProps) => {
    setStatus('loading');
    const response = await sendContactEmail(data as sendContactEmailProps);
    if (response.success) {
      setStatus('success');
      reset();
      trackEvent({
        user_data: {
          phone: data.phone,
        },
        meta: {
          event_name: 'Lead',
        },
        ga: {
          event_name: 'generate_lead',
          params: {},
        },
      })
    } else {
      setStatus('error')
    }
  };

  return (
    <form {...props} onSubmit={handleSubmit(onSubmit as SubmitHandler<FieldValues>)} data-status={status}>
      <Input
        label='Imię'
        register={register('name', {
          required: { value: true, message: 'Imię jest wymagane' },
        })}
        errors={errors}
        type='text'
      />
      <Input
        label='Numer telefonu'
        register={register('phone', {
          required: { value: true, message: 'Numer telefonu jest wymagany' },
          pattern: { value: REGEX.phone, message: 'Niepoprawny numer telefonu' },
        })}
        errors={errors}
        type='tel'
      />
      <Checkbox
        register={register('legal', {
          required: { value: true, message: 'Zgoda jest wymagana' },
        })}
        errors={errors}
      >
        Akceptuję <a href="/polityka-prywatnosci" target="_blank" rel="noopener noreferrer" className="link">
          politykę prywatności
        </a>
      </Checkbox>
      <Button type="submit">Wyślij wiadomość</Button>
      {children}
    </form>
  )
}
