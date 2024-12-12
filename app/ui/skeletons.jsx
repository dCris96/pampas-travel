import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";

export const AcountSkeleton = () => {
  return (
    <Stack spacing={1}>
      <Skeleton variant="rectangular" width={150} height={10} />
      <Skeleton variant="rectangular" width={150} height={10} />
    </Stack>
  );
};

export const SidebarSkeleton = () => {
  return <Skeleton variant="rectangular" width="100%" height={50} />;
};

export const CardsSkeleton = () => {
  return <Skeleton variant="rectangular" height={80} width="32.47%" />;
};

export const TablasSkeleton = () => {
  return (
    <Stack spacing={1}>
      <Skeleton variant="rectangular" width="100%" height={45} />
      <Skeleton variant="rectangular" width="100%" height={45} />
      <Skeleton variant="rectangular" width="100%" height={45} />
      <Skeleton variant="rectangular" width="100%" height={45} />
      <Skeleton variant="rectangular" width="100%" height={45} />
    </Stack>
  );
};

export const FotoPerfilSkeleton = () => {
  return (
    <Stack
      spacing={0.7}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Skeleton variant="rectangular" height={16} width="80%" />
      <Skeleton variant="circular" width={150} height={150} />
      <Skeleton variant="rectangular" height={16} width="80%" />
      <Skeleton variant="rectangular" height={16} width="80%" />
    </Stack>
  );
};
