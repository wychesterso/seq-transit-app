export interface UserLocation {
  lat: number;
  lon: number;
}

export function useLocation() {
  const location = { lat: -27.497445, lon: 153.011158 };
  const loading = false;
  const error = null;

  return { location, loading, error };

  // const [location, setLocation] = useState<UserLocation | null>(null);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   let isMounted = true;

  //   const getLocation = async () => {
  //     try {
  //       const { status } = await Location.requestForegroundPermissionsAsync();
  //       if (status !== "granted") {
  //         setError("Location permission denied");
  //         setLoading(false);
  //         return;
  //       }

  //       const loc = await Location.getCurrentPositionAsync({});
  //       if (!isMounted) return;

  //       setLocation({ lat: loc.coords.latitude, lon: loc.coords.longitude });
  //       setLoading(false);
  //     } catch (err) {
  //       setError("Failed to get location");
  //       setLoading(false);
  //     }
  //   };

  //   getLocation();

  //   return () => {
  //     isMounted = false;
  //   };
  // }, []);

  // return { location, loading, error };
}
