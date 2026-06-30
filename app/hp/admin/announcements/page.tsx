"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  toggleAnnouncementActive
} from "@/actions/admin-dashboard";
import { motion, AnimatePresence } from "framer-motion";
import {
  Megaphone,
  Plus,
  Trash2,
  Edit2,
  Power,
  Check,
  AlertTriangle,
  Loader2,
  X,
  Sparkles
} from "lucide-react";

interface AnnouncementItem {
  _id: string;
  title: string;
  description: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundColor: string;
  isActive: boolean;
  createdAt: string;
}

const announcementSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  buttonText: z.string().optional(),
  buttonLink: z.string().optional(),
  backgroundColor: z.string().min(4, "Invalid color code"),
  isActive: z.boolean(),
});

type AnnouncementFormInput = z.infer<typeof announcementSchema>;

const COLOR_PRESETS = [
  { name: "Rose", value: "#f43f5e" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Emerald", value: "#10b981" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Zinc", value: "#27272a" },
];

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [isEditingId, setIsEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [submittingForm, setSubmittingForm] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AnnouncementFormInput>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: "",
      description: "",
      buttonText: "",
      buttonLink: "",
      backgroundColor: "#f43f5e",
      isActive: false,
    },
  });

  const selectedBgColor = watch("backgroundColor");

  async function loadAnnouncements() {
    setIsLoading(true);
    try {
      const res = await getAnnouncements();
      if (res.success && res.announcements) {
        setAnnouncements(res.announcements);
      } else {
        setError(res.error || "Failed to load announcements.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to retrieve announcement log.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleEditClick = (ann: AnnouncementItem) => {
    setIsEditingId(ann._id);
    reset({
      title: ann.title,
      description: ann.description,
      buttonText: ann.buttonText || "",
      buttonLink: ann.buttonLink || "",
      backgroundColor: ann.backgroundColor,
      isActive: ann.isActive,
    });
    setFormOpen(true);
  };

  const handleCreateClick = () => {
    setIsEditingId(null);
    reset({
      title: "",
      description: "",
      buttonText: "",
      buttonLink: "",
      backgroundColor: "#f43f5e",
      isActive: false,
    });
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: AnnouncementFormInput) => {
    setSubmittingForm(true);
    try {
      let res;
      if (isEditingId) {
        res = await updateAnnouncement(isEditingId, data);
      } else {
        res = await createAnnouncement(data);
      }

      if (res.success) {
        setFormOpen(false);
        setIsEditingId(null);
        loadAnnouncements();
      } else {
        alert(res.error || "Failed to submit announcement.");
      }
    } catch (err: any) {
      alert(err.message || "An unexpected error occurred.");
    } finally {
      setSubmittingForm(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await toggleAnnouncementActive(id, !currentStatus);
      if (res.success) {
        loadAnnouncements();
      } else {
        alert(res.error || "Failed to update status.");
      }
    } catch (err: any) {
      alert(err.message || "An error occurred.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    try {
      const res = await deleteAnnouncement(id);
      if (res.success) {
        loadAnnouncements();
      } else {
        alert(res.error || "Failed to delete announcement.");
      }
    } catch (err: any) {
      alert(err.message || "An error occurred.");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Global Banners</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mt-1">Announcements</h1>
        </div>

        <button
          onClick={handleCreateClick}
          className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold font-mono uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create New
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: LIST OF BANNERS */}
        <div className="lg:col-span-2 space-y-4 relative min-h-[300px]">
          {isLoading && (
            <div className="absolute inset-0 bg-[#09090b]/50 backdrop-blur-[1px] flex items-center justify-center z-10">
              <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-950/40 border border-red-900/50 rounded-2xl flex items-start gap-2.5 text-xs text-red-200">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {announcements.length > 0 ? (
            announcements.map((ann) => (
              <motion.div
                key={ann._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 bg-zinc-950 border rounded-3xl transition-all shadow-md relative group ${
                  ann.isActive ? "border-rose-900/50 bg-rose-950/5" : "border-zinc-900"
                }`}
              >
                
                {/* Active indicator status banner */}
                <div className="flex justify-between items-center gap-4 mb-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono tracking-widest ${
                    ann.isActive 
                      ? "bg-emerald-950/50 text-emerald-400 border border-emerald-900/30"
                      : "bg-zinc-900 text-zinc-500 border border-zinc-800"
                  }`}>
                    {ann.isActive ? "ACTIVE BROADCASTING" : "INACTIVE"}
                  </span>

                  <div className="flex items-center gap-2">
                    {/* Toggle Active Button */}
                    <button
                      onClick={() => handleToggleActive(ann._id, ann.isActive)}
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                        ann.isActive
                          ? "bg-emerald-950/40 border-emerald-950 text-emerald-400 hover:bg-emerald-900/20"
                          : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                      }`}
                      title={ann.isActive ? "Deactivate" : "Activate"}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
                    {/* Edit Button */}
                    <button
                      onClick={() => handleEditClick(ann)}
                      className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(ann._id)}
                      className="p-1.5 bg-zinc-900 hover:bg-red-950/30 border border-zinc-800 hover:border-red-950 text-zinc-500 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Banner title / desc */}
                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-white font-mono">{ann.title}</h3>
                  <p className="text-xs text-zinc-400 font-mono leading-relaxed">{ann.description}</p>
                </div>

                {/* Mock preview banner visualization */}
                <div className="mt-4 pt-4 border-t border-zinc-900">
                  <p className="text-[10px] text-zinc-500 font-mono mb-2">Bespoke Header Preview:</p>
                  
                  <div
                    style={{ backgroundColor: ann.backgroundColor }}
                    className="p-3 text-white rounded-xl flex items-center justify-between gap-4 text-xs font-semibold shadow-inner"
                  >
                    <div className="flex items-center gap-2">
                      <Megaphone className="w-3.5 h-3.5 text-white animate-bounce shrink-0" />
                      <span className="truncate">{ann.title} — {ann.description}</span>
                    </div>
                    {ann.buttonText && (
                      <span className="px-3 py-1 bg-white text-zinc-900 rounded-lg text-[9px] font-bold uppercase tracking-wider shrink-0 select-none">
                        {ann.buttonText}
                      </span>
                    )}
                  </div>
                </div>

              </motion.div>
            ))
          ) : (
            <div className="p-12 text-center border-2 border-dashed border-zinc-900 rounded-3xl text-zinc-500 font-mono text-xs">
              <Megaphone className="w-8 h-8 mx-auto mb-3" />
              <span>No announcements generated yet.</span>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: CREATE/EDIT SIDE BAR FORM */}
        <AnimatePresence>
          {formOpen && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl shadow-xl h-fit space-y-6"
            >
              
              <div className="flex justify-between items-center pb-3 border-b border-zinc-900">
                <h3 className="text-sm font-bold text-white font-mono uppercase">
                  {isEditingId ? "Edit Announcement" : "Create Announcement"}
                </h3>
                <button
                  onClick={() => setFormOpen(false)}
                  className="p-1 text-zinc-500 hover:text-white rounded-md hover:bg-zinc-900 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Input fields */}
              <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 text-xs">
                
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Server Maintenance"
                    {...register("title")}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-rose-500/80 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                  {errors.title && (
                    <span className="text-[10px] text-red-500">{errors.title.message}</span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">Description</label>
                  <textarea
                    placeholder="e.g. Our servers will undergo a 15-minute upgrade tonight at 12:00 AM UTC."
                    rows={3}
                    {...register("description")}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-rose-500/80 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                  {errors.description && (
                    <span className="text-[10px] text-red-500">{errors.description.message}</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">Button Text</label>
                    <input
                      type="text"
                      placeholder="e.g. Read Info"
                      {...register("buttonText")}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-rose-500/80 rounded-xl px-3 py-2.5 text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">Button Link</label>
                    <input
                      type="text"
                      placeholder="e.g. /maintenance"
                      {...register("buttonLink")}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-rose-500/80 rounded-xl px-3 py-2.5 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Color Selector preset chips */}
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">Banner Background Color</label>
                  
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setValue("backgroundColor", preset.value)}
                        style={{ backgroundColor: preset.value }}
                        className={`w-6 h-6 rounded-full border transition-all cursor-pointer flex items-center justify-center text-white ${
                          selectedBgColor === preset.value
                            ? "ring-2 ring-rose-500/40 border-white scale-110"
                            : "border-zinc-800"
                        }`}
                        title={preset.name}
                      >
                        {selectedBgColor === preset.value && <Check className="w-3 h-3 text-white" />}
                      </button>
                    ))}
                    
                    {/* Custom Color Input picker */}
                    <div className="relative w-6 h-6 rounded-full border border-zinc-800 overflow-hidden cursor-pointer">
                      <input
                        type="color"
                        {...register("backgroundColor")}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <div
                        style={{ backgroundColor: selectedBgColor }}
                        className="w-full h-full flex items-center justify-center font-bold text-[9px] text-white"
                      >
                        +
                      </div>
                    </div>
                  </div>
                </div>

                {/* Active check toggle */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    {...register("isActive")}
                    className="w-4 h-4 rounded border-zinc-800 text-rose-500 bg-zinc-900 focus:ring-rose-500 cursor-pointer"
                  />
                  <label htmlFor="isActive" className="font-mono text-zinc-400 font-bold cursor-pointer">
                    Enable banner instantly (deactivates others)
                  </label>
                </div>

                <div className="flex gap-2.5 pt-4">
                  <button
                    type="button"
                    onClick={() => setFormOpen(false)}
                    className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingForm}
                    className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {submittingForm ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                      </>
                    ) : (
                      "Save Banner"
                    )}
                  </button>
                </div>

              </form>

              <div className="bg-zinc-900/40 p-4 border border-zinc-900 rounded-2xl flex items-start gap-2.5 text-[10px] font-mono text-zinc-500">
                <Sparkles className="w-4 h-4 text-yellow-400 shrink-0" />
                <span>Active banners will immediately display on the homepage landing header for all public visitors.</span>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
}
