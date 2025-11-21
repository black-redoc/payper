import { CompanyForm } from "@/presentation/components/Settings/CompanyForm";

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2">Configuración</h1>
        <p className="text-gray-600">Gestiona la información de tu empresa y ajustes generales</p>
      </div>

      <CompanyForm />
    </div>
  );
}