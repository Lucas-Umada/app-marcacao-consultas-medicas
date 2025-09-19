import React from "react";
import { User, getRoleText } from "../models/user";
import {
  ProfileCardContainer,
  Avatar,
  Name,
  Email,
  RoleBadge,
  RoleText,
  SpecialtyText,
} from "../styles";

interface ProfileCardProps {
  user: User | null;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user }) => {
  if (!user) return null;

  return (
    <ProfileCardContainer>
      <Avatar
        source={{ uri: user?.image || "https://via.placeholder.com/150" }}
      />
      <Name>{user.name}</Name>
      <Email>{user.email}</Email>
      <RoleBadge role={user.role}>
        <RoleText>{getRoleText(user.role)}</RoleText>
      </RoleBadge>
      {user.role === "doctor" && user.specialty && (
        <SpecialtyText>Especialidade: {user.specialty}</SpecialtyText>
      )}
    </ProfileCardContainer>
  );
};

export default ProfileCard;