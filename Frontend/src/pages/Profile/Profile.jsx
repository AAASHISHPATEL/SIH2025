import { useAuth } from "../../auth/AuthContext";

export default function Profile() {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  if (!user) return <p>No user logged in</p>;

  return (
    <div className="profile-page">
      <h1>User Profile</h1>
      <p>
        <strong>Name:</strong> {user.name}
      </p>
      <p>
        <strong>Email:</strong> {user.email}
      </p>
    </div>
  );
}
