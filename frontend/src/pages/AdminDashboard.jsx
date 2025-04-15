// src/pages/AdminDashboard.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  Box,
  Grid,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
} from "@mui/material";
import { supabase } from "../supabaseClient";

// Import chart components and register Chart.js modules
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
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
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editProfileId, setEditProfileId] = useState(null);
  const [deleteProfileId, setDeleteProfileId] = useState(null);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "candidate",
  });

  // Fetch profiles from both "profiles" and "recruiter_profiles" tables
// Usually run from a secure environment or with a service_key,
// unless you create the appropriate RLS policy.
const fetchAllAuthUsers = async () => {
  const { data, error } = await supabase
    .from("auth.users")
    .select("*");

  if (error) {
    console.error("Error fetching auth.users data:", error);
    return;
  }
  console.log("All auth.users:", data);
};

  useEffect(() => {
    fetchProfiles();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Create a new profile (only added to the "profiles" table)
  const handleCreate = async () => {
    const { error } = await supabase.from("profiles").insert([formData]);
    if (error) {
      console.error("Error creating profile:", error);
      setAlert({
        open: true,
        message: "Error creating profile",
        severity: "error",
      });
    } else {
      setAlert({
        open: true,
        message: "Profile created successfully",
        severity: "success",
      });
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        role: "candidate",
      });
      setOpenCreateModal(false);
      fetchProfiles();
    }
  };

  // Set up edit mode for an existing profile (opens edit modal)
  const handleEdit = (profile) => {
    setEditProfileId(profile.id);
    setFormData({
      first_name: profile.first_name,
      last_name: profile.last_name,
      email: profile.email,
      role: profile.role,
    });
  };

  // Update an existing profile (only applies to the "profiles" table)
  const handleUpdate = async () => {
    const { error } = await supabase
      .from("profiles")
      .update(formData)
      .match({ id: editProfileId });
    if (error) {
      console.error("Error updating profile:", error);
      setAlert({
        open: true,
        message: "Error updating profile",
        severity: "error",
      });
    } else {
      setAlert({
        open: true,
        message: "Profile updated successfully",
        severity: "success",
      });
      setEditProfileId(null);
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        role: "candidate",
      });
      fetchProfiles();
    }
  };

  // Confirm deletion of a profile (only from the "profiles" table)
  const handleDeleteConfirm = async () => {
    const id = deleteProfileId;
    setDeleteProfileId(null);
    const { error } = await supabase.from("profiles").delete().match({ id });
    if (error) {
      console.error("Error deleting profile:", error);
      setAlert({
        open: true,
        message: "Error deleting profile",
        severity: "error",
      });
    } else {
      setAlert({
        open: true,
        message: "Profile deleted successfully",
        severity: "success",
      });
      fetchProfiles();
    }
  };

  // Compute key metrics and counts
  const totalProfiles = profiles.length;
  const roleCounts = useMemo(() => {
    const counts = { candidate: 0, recruiter: 0, admin: 0 };
    profiles.forEach((profile) => {
      const role = profile.role ? profile.role.toLowerCase() : "unknown";
      counts[role] = (counts[role] || 0) + 1;
    });
    return counts;
  }, [profiles]);

  // Prepare Bar Chart data (profiles count per role)
  const barData = {
    labels: Object.keys(roleCounts),
    datasets: [
      {
        label: "Number of Profiles",
        data: Object.values(roleCounts),
        backgroundColor: [
          "rgba(75,192,192,0.6)",
          "rgba(255,206,86,0.6)",
          "rgba(153,102,255,0.6)",
        ],
        borderColor: [
          "rgba(75,192,192,1)",
          "rgba(255,206,86,1)",
          "rgba(153,102,255,1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare Pie Chart data (profiles distribution)
  const pieData = {
    labels: Object.keys(roleCounts),
    datasets: [
      {
        label: "Profiles Distribution",
        data: Object.values(roleCounts),
        backgroundColor: [
          "rgba(75,192,192,0.6)",
          "rgba(255,206,86,0.6)",
          "rgba(153,102,255,0.6)",
        ],
        borderColor: [
          "rgba(75,192,192,1)",
          "rgba(255,206,86,1)",
          "rgba(153,102,255,1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Compute profile creation trend (assuming a created_at timestamp exists)
  const dateCounts = useMemo(() => {
    const counts = {};
    profiles.forEach((profile) => {
      if (profile.created_at) {
        const date = new Date(profile.created_at).toLocaleDateString();
        counts[date] = (counts[date] || 0) + 1;
      }
    });
    const sortedDates = Object.keys(counts).sort(
      (a, b) => new Date(a) - new Date(b)
    );
    const sortedCounts = sortedDates.map((date) => counts[date]);
    return { labels: sortedDates, data: sortedCounts };
  }, [profiles]);

  // Prepare Line Chart data (profile creation trend)
  const lineData = {
    labels: dateCounts.labels,
    datasets: [
      {
        label: "Profiles Created Over Time",
        data: dateCounts.data,
        fill: false,
        tension: 0.2,
        borderColor: "rgba(255,99,132,1)",
        backgroundColor: "rgba(255,99,132,0.2)",
      },
    ],
  };

  // Common chart container style
  const chartContainerStyle = {
    p: 2,
    backgroundColor: "#f4f4f4",
    borderRadius: 1,
  };

  return (
    <Container sx={{ my: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      {/* INFO CARDS SECTION */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: "center", p: 1 }}>
            <CardContent>
              <Typography variant="h6">Total Profiles</Typography>
              <Typography variant="h4">{totalProfiles}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: "center", p: 1 }}>
            <CardContent>
              <Typography variant="h6">Candidates</Typography>
              <Typography variant="h4">{roleCounts.candidate}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: "center", p: 1 }}>
            <CardContent>
              <Typography variant="h6">Recruiters</Typography>
              <Typography variant="h4">{roleCounts.recruiter}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: "center", p: 1 }}>
            <CardContent>
              <Typography variant="h6">Admins</Typography>
              <Typography variant="h4">{roleCounts.admin}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* CHARTS SECTION */}
      <Box sx={{ my: 4 }}>
        <Grid container spacing={2}>
          {/* Bar Chart */}
          <Grid item xs={12} md={4}>
            <Box sx={chartContainerStyle}>
              <Typography variant="h6" gutterBottom>
                Profiles by Role
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Distribution of profiles across roles.
              </Typography>
              <Box sx={{ height: 300 }}>
                <Bar
                  data={barData}
                  options={{ maintainAspectRatio: false, responsive: true }}
                />
              </Box>
            </Box>
          </Grid>
          {/* Pie Chart */}
          <Grid item xs={12} md={4}>
            <Box sx={chartContainerStyle}>
              <Typography variant="h6" gutterBottom>
                Profiles Distribution
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Proportional distribution of user roles.
              </Typography>
              <Box sx={{ height: 300 }}>
                <Pie
                  data={pieData}
                  options={{ maintainAspectRatio: false, responsive: true }}
                />
              </Box>
            </Box>
          </Grid>
          {/* Line Chart */}
          <Grid item xs={12} md={4}>
            <Box sx={chartContainerStyle}>
              <Typography variant="h6" gutterBottom>
                Profile Creation Trend
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Profiles created over time.
              </Typography>
              <Box sx={{ height: 300 }}>
                <Line
                  data={lineData}
                  options={{ maintainAspectRatio: false, responsive: true }}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* PROFILES TABLE SECTION */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">Profiles</Typography>
        <Button
          variant="contained"
          onClick={() => {
            setFormData({
              first_name: "",
              last_name: "",
              email: "",
              role: "candidate",
            });
            setOpenCreateModal(true);
          }}
        >
          New Profile
        </Button>
      </Box>
      {loading ? (
        <Typography>Loading profiles...</Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Picture</TableCell>
              <TableCell>First Name</TableCell>
              <TableCell>Last Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {profiles.map((profile) => (
              <TableRow key={profile.id}>
                <TableCell>
                  <img
                    src={
                      profile.profile_picture ||
                      "https://via.placeholder.com/50"
                    }
                    alt={`${profile.first_name} ${profile.last_name}`}
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                    }}
                  />
                </TableCell>
                <TableCell>{profile.first_name}</TableCell>
                <TableCell>{profile.last_name}</TableCell>
                <TableCell>{profile.email}</TableCell>
                <TableCell>{profile.role}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    sx={{ mr: 1 }}
                    onClick={() => handleEdit(profile)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setDeleteProfileId(profile.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* CREATE PROFILE MODAL */}
      <Dialog open={openCreateModal} onClose={() => setOpenCreateModal(false)}>
        <DialogTitle>Create Profile</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="First Name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
            />
            <TextField
              label="Last Name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
            />
            <TextField
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            <Select
              label="Role"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <MenuItem value="candidate">Candidate</MenuItem>
              <MenuItem value="recruiter">Recruiter</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>
            Create Profile
          </Button>
        </DialogActions>
      </Dialog>

      {/* EDIT PROFILE MODAL */}
      <Dialog
        open={Boolean(editProfileId)}
        onClose={() => setEditProfileId(null)}
      >
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="First Name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
            />
            <TextField
              label="Last Name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
            />
            <TextField
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            <Select
              label="Role"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <MenuItem value="candidate">Candidate</MenuItem>
              <MenuItem value="recruiter">Recruiter</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditProfileId(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate}>
            Update Profile
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR ALERT */}
      <Snackbar
        open={alert.open}
        autoHideDuration={3000}
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setAlert({ ...alert, open: false })}
          severity={alert.severity}
          sx={{ width: "100%" }}
        >
          {alert.message}
        </Alert>
      </Snackbar>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog
        open={Boolean(deleteProfileId)}
        onClose={() => setDeleteProfileId(null)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this profile?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteProfileId(null)}>Cancel</Button>
          <Button color="error" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;
