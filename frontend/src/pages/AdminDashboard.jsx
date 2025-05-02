// src/pages/AdminDashboard.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  Card,
  CardContent,
  Avatar,
  useTheme,
  alpha,
  FormControl,
  InputLabel,
} from "@mui/material";
import { supabase } from "../supabaseClient";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const theme = useTheme();

  // ─── State ─────────────────────────────────────────
  const [profiles, setProfiles] = useState([]);
  const [recProfiles, setRecProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ open: false, msg: "", sev: "success" });

  // modal/form
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    type: "User",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    role: "candidate",
    phone: "",
    address: "",
    company: "",
    profile_picture: "",
    description: "",
    bio: "",
    website: "",
    linkedin: "",
    github: "",
    twitter: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);

  // filtering & pagination
  const [filterText, setFilterText] = useState("");
  const [filterType, setFilterType] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ─── Admin Guard + Initial Fetch ──────────────────
  useEffect(() => {
    (async () => {
      const {
        data: { session },
        error: sessErr,
      } = await supabase.auth.getSession();
      if (sessErr || !session) return navigate("/login");

      const { data: me, error: meErr } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();
      if (meErr || me.role !== "admin") return navigate("/");

      await fetchAll();
    })();
  }, [navigate]);

  async function fetchAll() {
    setLoading(true);
    await Promise.all([fetchProfiles(), fetchRecProfiles()]);
    setLoading(false);
  }

  async function fetchProfiles() {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, email, role, profile_picture, created_at");
    if (error) setAlert({ open: true, msg: error.message, sev: "error" });
    else setProfiles(data);
  }

  async function fetchRecProfiles() {
    const { data, error } = await supabase
      .from("recruiter_profiles")
      .select(
        "id, email, company, profile_picture, description, phone, website, linkedin, twitter, created_at"
      )
      .order("created_at", { ascending: false });
    if (error) setAlert({ open: true, msg: error.message, sev: "error" });
    else setRecProfiles(data);
  }

  // ─── Helpers ──────────────────────────────────────
  function getAvatarUrl(pic) {
    if (!pic) return "https://via.placeholder.com/40";
    if (pic.startsWith("http")) return pic;
    return `https://vnylejypvgatgsvomjsk.supabase.co/storage/v1/object/public/avatars/${pic}`;
  }

  function openCreate(type) {
    setEditing(null);
    setForm({
      type,
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      role: type === "Recruiter" ? "recruiter" : "candidate",
      phone: "",
      address: "",
      company: "",
      profile_picture: "",
      description: "",
      bio: "",
      website: "",
      linkedin: "",
      github: "",
      twitter: "",
    });
    setAvatarFile(null);
    setOpenModal(true);
  }

  function openEdit(item, type) {
    setEditing({ type, id: item.id });
    setForm({ type, ...item, password: "" });
    setAvatarFile(null);
    setOpenModal(true);
  }

  const handleFormChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const handleFile = (e) => setAvatarFile(e.target.files?.[0] || null);

  async function handleSave() {
    let picPath = form.profile_picture;
    if (avatarFile) {
      const filename = `${Date.now()}_${avatarFile.name}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(filename, avatarFile, { upsert: true });
      if (upErr)
        return setAlert({ open: true, msg: upErr.message, sev: "error" });
      picPath = filename;
    }

    if (!editing) {
      // CREATE
      if (form.type === "User") {
        const { data: authData, error: signErr } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
        });
        if (signErr)
          return setAlert({ open: true, msg: signErr.message, sev: "error" });

        const { error: insErr } = await supabase.from("profiles").insert([
          {
            id: authData.user.id,
            ...form,
            profile_picture: picPath,
          },
        ]);
        if (insErr)
          return setAlert({ open: true, msg: insErr.message, sev: "error" });
        setAlert({ open: true, msg: "User created", sev: "success" });
      } else {
        const { error: rErr } = await supabase
          .from("recruiter_profiles")
          .insert([{ ...form, profile_picture: picPath }]);
        if (rErr)
          return setAlert({ open: true, msg: rErr.message, sev: "error" });
        setAlert({ open: true, msg: "Recruiter created", sev: "success" });
      }
    } else {
      // UPDATE
      const updates = { ...form, profile_picture: picPath };
      const table = editing.type === "User" ? "profiles" : "recruiter_profiles";
      const { error: uErr } = await supabase
        .from(table)
        .update(updates)
        .eq("id", editing.id);
      if (uErr)
        return setAlert({ open: true, msg: uErr.message, sev: "error" });
      setAlert({
        open: true,
        msg: `${editing.type} updated`,
        sev: "success",
      });
    }

    setOpenModal(false);
    fetchAll();
  }

  async function handleDelete() {
    if (!editing) return;
    const table = editing.type === "User" ? "profiles" : "recruiter_profiles";
    const { error } = await supabase.from(table).delete().eq("id", editing.id);
    if (error)
      return setAlert({ open: true, msg: error.message, sev: "error" });
    setAlert({ open: true, msg: `${editing.type} deleted`, sev: "success" });
    setOpenModal(false);
    fetchAll();
  }

  // ─── Charts Data ───────────────────────────────────
  const roleCounts = useMemo(() => {
    const candidate = profiles.filter(
      (u) => (u.role || "candidate").toLowerCase() === "candidate"
    ).length;
    const admin = profiles.filter(
      (u) => (u.role || "candidate").toLowerCase() === "admin"
    ).length;
    const recruiter = recProfiles.length;
    return { candidate, admin, recruiter };
  }, [profiles, recProfiles]);

  const roles = ["Candidate", "Admin", "Recruiter"];
  const solid = [
    theme.palette.primary.main,
    theme.palette.warning.main,
    theme.palette.secondary.main,
  ];
  const translucent = solid.map((c) => alpha(c, 0.6));

  const barData = {
    labels: roles,
    datasets: [
      {
        label: "Profiles by Role",
        data: [roleCounts.candidate, roleCounts.admin, roleCounts.recruiter],
        backgroundColor: translucent,
        borderColor: solid,
        borderWidth: 1,
      },
    ],
  };

  const dateMap = useMemo(() => {
    const initCounts = { candidate: 0, admin: 0, recruiter: 0 };
    const m = {};
    profiles.forEach(({ created_at, role }) => {
      const d = new Date(created_at).toLocaleDateString();
      if (!m[d]) m[d] = { ...initCounts };
      const key = (role || "candidate").toLowerCase();
      if (key === "candidate" || key === "admin") m[d][key]++;
    });
    recProfiles.forEach(({ created_at }) => {
      const d = new Date(created_at).toLocaleDateString();
      if (!m[d]) m[d] = { ...initCounts };
      m[d].recruiter++;
    });
    const dates = Object.keys(m).sort((a, b) => new Date(a) - new Date(b));
    return { dates, m };
  }, [profiles, recProfiles]);

  const lineData = {
    labels: dateMap.dates,
    datasets: [
      {
        label: "Candidate",
        data: dateMap.dates.map((d) => dateMap.m[d].candidate),
        fill: false,
        tension: 0.3,
        borderColor: solid[0],
        backgroundColor: translucent[0],
      },
      {
        label: "Admin",
        data: dateMap.dates.map((d) => dateMap.m[d].admin),
        fill: false,
        tension: 0.3,
        borderColor: solid[1],
        backgroundColor: translucent[1],
      },
      {
        label: "Recruiter",
        data: dateMap.dates.map((d) => dateMap.m[d].recruiter),
        fill: false,
        tension: 0.3,
        borderColor: solid[2],
        backgroundColor: translucent[2],
      },
    ],
  };

  const chartBox = {
    p: 2,
    bgcolor: theme.palette.grey[50],
    borderRadius: 2,
    boxShadow: 1,
  };

  // ─── Combine & Filter ─────────────────────────────
  const combined = useMemo(
    () => [
      ...profiles.map((u) => ({ type: "User", ...u })),
      ...recProfiles.map((r) => ({ type: "Recruiter", ...r })),
    ],
    [profiles, recProfiles]
  );

  const filtered = useMemo(
    () =>
      combined.filter((u) => {
        if (filterType && u.type !== filterType) return false;
        if (!filterText) return true;
        const txt = filterText.toLowerCase();
        return (
          u.first_name?.toLowerCase().includes(txt) ||
          u.last_name?.toLowerCase().includes(txt) ||
          u.email?.toLowerCase().includes(txt)
        );
      }),
    [combined, filterText, filterType]
  );

  const paginated = filtered.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  return (
    <Container sx={{ my: 4 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Admin Dashboard
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => navigate("/admin-resume")}
        >
          Resume Dashboard
        </Button>
      </Box>

      {/* Info Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          ["Total Users", profiles.length + recProfiles.length],
          ["Candidates", roleCounts.candidate],
          ["Admins", roleCounts.admin],
          ["Recruiters", recProfiles.length],
        ].map(([title, val]) => (
          <Grid item xs={12} sm={6} md={3} key={title}>
            <Card
              elevation={3}
              sx={{
                textAlign: "center",
                py: 2,
                bgcolor: theme.palette.background.paper,
                borderLeft: `5px solid ${theme.palette.primary.main}`,
              }}
            >
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  {title}
                </Typography>
                <Typography variant="h5" color="primary">
                  {val}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Box sx={chartBox}>
            <Typography variant="h6">Profiles by Role</Typography>
            <Box sx={{ height: 300 }}>
              <Bar data={barData} options={{ maintainAspectRatio: false }} />
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={chartBox}>
            <Typography variant="h6">Profile Creation Trend</Typography>
            <Box sx={{ height: 300 }}>
              <Line data={lineData} options={{ maintainAspectRatio: false }} />
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
        <TextField
          size="small"
          label="Search"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          sx={{ flex: "1 1 240px" }}
        />
        <FormControl size="small" sx={{ width: 160 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={filterType}
            label="Type"
            onChange={(e) => setFilterType(e.target.value)}
          >
            <MenuItem value="">
              <em>All</em>
            </MenuItem>
            <MenuItem value="User">User</MenuItem>
            <MenuItem value="Recruiter">Recruiter</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Combined Table */}
      {loading ? (
        <Typography>Loading…</Typography>
      ) : (
        <>
          <Table>
            <TableHead>
              <TableRow>
                {[
                  "Type",
                  "Role",
                  "Avatar",
                  "First",
                  "Last",
                  "Company",
                  "Email",
                  "Created",
                  "Actions",
                ].map((h) => (
                  <TableCell key={h}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((row) => (
                <TableRow
                  key={`${row.type}-${row.id}`}
                  sx={{
                    "&:nth-of-type(odd)": {
                      backgroundColor: theme.palette.action.hover,
                    },
                    "&:hover": {
                      backgroundColor: theme.palette.action.selected,
                    },
                  }}
                >
                  <TableCell>{row.type}</TableCell>
                  <TableCell sx={{ textTransform: "capitalize" }}>
                    {row.role}
                  </TableCell>
                  <TableCell>
                    <Avatar src={getAvatarUrl(row.profile_picture)}>
                      {!row.profile_picture && row.first_name?.[0]}
                    </Avatar>
                  </TableCell>
                  <TableCell>{row.first_name}</TableCell>
                  <TableCell>{row.last_name}</TableCell>
                  <TableCell>{row.company}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>
                    {new Date(row.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      onClick={() => openEdit(row, row.type)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => openEdit(row, row.type)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </>
      )}

      {/* Create/Edit/Delete Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {(editing ? "Edit" : "Create") + " " + form.type}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mt: 1 }}>
            <TextField
              label="Email"
              name="email"
              value={form.email}
              onChange={handleFormChange}
              fullWidth
            />
            {form.type === "User" && !editing && (
              <TextField
                label="Password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleFormChange}
                fullWidth
              />
            )}
            {form.type === "User" && (
              <>
                <TextField
                  label="First Name"
                  name="first_name"
                  value={form.first_name}
                  onChange={handleFormChange}
                  fullWidth
                />
                <TextField
                  label="Last Name"
                  name="last_name"
                  value={form.last_name}
                  onChange={handleFormChange}
                  fullWidth
                />
                <Select
                  name="role"
                  value={form.role}
                  onChange={handleFormChange}
                  fullWidth
                >
                  {["candidate", "recruiter", "admin"].map((r) => (
                    <MenuItem key={r} value={r}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </>
            )}
            {form.type === "Recruiter" && (
              <TextField
                label="Company"
                name="company"
                value={form.company}
                onChange={handleFormChange}
                fullWidth
              />
            )}
            <TextField
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleFormChange}
              fullWidth
            />
            <TextField
              label="Website"
              name="website"
              value={form.website}
              onChange={handleFormChange}
              fullWidth
            />
            <TextField
              label="LinkedIn"
              name="linkedin"
              value={form.linkedin}
              onChange={handleFormChange}
              fullWidth
            />
            <TextField
              label="Twitter"
              name="twitter"
              value={form.twitter}
              onChange={handleFormChange}
              fullWidth
            />
            <TextField
              label="Avatar URL"
              name="profile_picture"
              value={form.profile_picture}
              onChange={handleFormChange}
              fullWidth
            />
            <Button variant="outlined" component="label">
              Upload Avatar
              <input type="file" hidden accept="image/*" onChange={handleFile} />
            </Button>
            {avatarFile && <Typography>{avatarFile.name}</Typography>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          {editing && (
            <Button color="error" onClick={handleDelete}>
              Delete
            </Button>
          )}
          <Button variant="contained" onClick={handleSave}>
            {editing ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={3000}
        onClose={() => setAlert((a) => ({ ...a, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setAlert((a) => ({ ...a, open: false }))}
          severity={alert.sev}
          sx={{ width: "100%" }}
        >
          {alert.msg}
        </Alert>
      </Snackbar>
    </Container>
  );
}
