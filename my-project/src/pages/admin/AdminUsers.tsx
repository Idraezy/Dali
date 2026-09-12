import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, ShieldOff } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../lib/useAuth";
import type { Profile } from "../../lib/types";

function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    setUsers((data ?? []) as Profile[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleAdmin = async (u: Profile) => {
    if (u.id === currentUser?.id) {
      alert("You can't change your own admin status.");
      return;
    }
    setUpdatingId(u.id);
    const { error } = await supabase
      .from("profiles")
      .update({ is_admin: !u.is_admin })
      .eq("id", u.id);
    setUpdatingId(null);
    if (error) {
      alert(error.message);
      return;
    }
    setUsers((prev) => prev.map((p) => (p.id === u.id ? { ...p, is_admin: !p.is_admin } : p)));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Users ({users.length})</h2>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-400 py-10">
          <Loader2 className="animate-spin" /> Loading users...
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 text-sm border-b border-gray-700">
                <th className="py-3 pr-4">Email</th>
                <th className="py-3 pr-4">Name</th>
                <th className="py-3 pr-4">Joined</th>
                <th className="py-3 pr-4">Role</th>
                <th className="py-3 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-800">
                  <td className="py-3 pr-4">{u.email}</td>
                  <td className="py-3 pr-4 text-gray-400">{u.full_name || "—"}</td>
                  <td className="py-3 pr-4 text-gray-400">
                    {new Date(u.created_at).toLocaleDateString("en-NG")}
                  </td>
                  <td className="py-3 pr-4">
                    {u.is_admin ? (
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#00DA6B] text-[#001D23]">
                        ADMIN
                      </span>
                    ) : (
                      <span className="text-gray-500 text-xs">Customer</span>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <button
                      onClick={() => toggleAdmin(u)}
                      disabled={updatingId === u.id || u.id === currentUser?.id}
                      className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border border-gray-700 hover:bg-[#002a35] transition disabled:opacity-40"
                    >
                      {u.is_admin ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                      {u.is_admin ? "Revoke Admin" : "Make Admin"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
