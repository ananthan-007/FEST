import InstitutionManager from '@/components/admin/InstitutionManager'

export default function AdminInstitutionsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#C8102E] block mb-1">
          Jurisdiction Directorate
        </span>
        <h1 className="text-2xl font-serif text-[#DDE2F6]">NCC Institutional Hierarchy</h1>
        <p className="text-xs text-[#8A94A8] mt-1">
          Manage Group Headquarters → Battalions → Affiliated Educational Institutions.
        </p>
      </div>

      <InstitutionManager />
    </div>
  )
}
