import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  name:    z.string().min(1, 'Povinné pole'),
  surname: z.string().min(1, 'Povinné pole'),
  email:   z.string().email('Neplatný e-mail').or(z.literal('')),
  phone:   z.string().optional(),
})

export type OrderFormValues = z.infer<typeof schema>

interface Props {
  onSubmit: (values: OrderFormValues) => void
  submitting: boolean
  submitLabel: string
}

export function OrderForm({ onSubmit, submitting, submitLabel }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<OrderFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', surname: '', email: '', phone: '' },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="bg-white rounded-lg p-5 mb-4 border border-gray-200">
        <div className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3.5">
          Údaje objednatele
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Příjmení *" error={errors.surname?.message}>
            <input {...register('surname')} placeholder="Novák"
              className="w-full px-3.5 py-2.5 rounded-md border-2 border-gray-200 text-sm font-barlow focus:border-navy-500" />
          </Field>
          <Field label="Jméno *" error={errors.name?.message}>
            <input {...register('name')} placeholder="Jan"
              className="w-full px-3.5 py-2.5 rounded-md border-2 border-gray-200 text-sm font-barlow focus:border-navy-500" />
          </Field>
          <Field label="E-mail" error={errors.email?.message}>
            <input {...register('email')} type="email" placeholder="jan@email.cz"
              className="w-full px-3.5 py-2.5 rounded-md border-2 border-gray-200 text-sm font-barlow focus:border-navy-500" />
          </Field>
          <Field label="Telefon" error={errors.phone?.message}>
            <input {...register('phone')} type="tel" placeholder="+420 ..."
              className="w-full px-3.5 py-2.5 rounded-md border-2 border-gray-200 text-sm font-barlow focus:border-navy-500" />
          </Field>
        </div>
      </div>

      <div className="bg-navy-50 border border-navy-200 rounded-lg px-4.5 py-3.5 text-sm text-navy-800 mb-4 leading-relaxed">
        Platba převodem na účet KVS. Do poznámky uveďte:{' '}
        <strong>jméno závodníka — oblečení</strong>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className={`w-full py-4 border-none rounded-lg font-black text-base cursor-pointer font-barlow-condensed uppercase tracking-wide text-white transition-colors
          ${submitting ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-br from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'}`}
      >
        {submitLabel}
      </button>
    </form>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600 mt-1 font-medium">{error}</p>}
    </div>
  )
}
