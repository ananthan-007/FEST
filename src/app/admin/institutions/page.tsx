import InstitutionManager from '@/components/admin/InstitutionManager'
import { ShinyText } from '@/components/reactbits'

export default function AdminInstitutionsPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="border-b border-[#3A291B]/80 pb-5">
        <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#CC892F] block mb-1">
          Jurisdiction Directorate
        </span>
        <h1 className="text-3xl font-serif text-[#F5EFE6]">
          Institutional <ShinyText text="Hierarchy" speed={5} className="font-serif" />
        </h1>
        <p className="text-xs text-[#A89F91] mt-1">
          Manage Kerala NCC Group Headquarters → Battalions → Affiliated Educational Institutions.
        </p>
      </div>

      <InstitutionManager />
    </div>
  )
}
