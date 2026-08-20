import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

const Announcements = async ({ classId }: { classId?: number | string }) => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role;

  let query = supabase.from("Announcement").select("*, class:Class(id)").limit(3).order("date", { ascending: false });

  if (role !== "admin") {
    // Show global announcements OR announcements for the specific class
    if (classId) {
      query = query.or(`classId.is.null,classId.eq.${classId}`);
    } else {
      query = query.is("classId", null);
    }
  }

  const { data, error } = await query;

  if (error) console.error(error);

  // Note: Data structure might be slightly different. 
  // If we only show 3, mapping by index 0,1,2 is fine.

  return (
    <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100 animate-slide-up">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Announcements</h1>
        <span className="text-xs text-gray-400 hover:text-lamaSky cursor-pointer transition-colors font-medium">View All</span>
      </div>
      <div className="flex flex-col gap-4 mt-4">
        {data?.[0] && (
          <div className="bg-lamaSkyLight rounded-xl p-4 hover-lift transition-all duration-200 cursor-pointer border border-lamaSky/10">
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-gray-800">{data[0].title}</h2>
              <span className="text-xs text-gray-500 bg-white/80 rounded-md px-2 py-0.5 font-medium shadow-2xs">
                {formatDate(data[0].date)}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{data[0].description}</p>
          </div>
        )}
        {data?.[1] && (
          <div className="bg-lamaPurpleLight rounded-xl p-4 hover-lift transition-all duration-200 cursor-pointer border border-lamaPurple/10">
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-gray-800">{data[1].title}</h2>
              <span className="text-xs text-gray-500 bg-white/80 rounded-md px-2 py-0.5 font-medium shadow-2xs">
                {formatDate(data[1].date)}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{data[1].description}</p>
          </div>
        )}
        {data?.[2] && (
          <div className="bg-lamaYellowLight rounded-xl p-4 hover-lift transition-all duration-200 cursor-pointer border border-lamaYellow/20">
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-gray-800">{data[2].title}</h2>
              <span className="text-xs text-gray-500 bg-white/80 rounded-md px-2 py-0.5 font-medium shadow-2xs">
                {formatDate(data[2].date)}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{data[2].description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;
