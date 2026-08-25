-- Restrict privileged competition lifecycle operations to trusted service-role jobs.
REVOKE EXECUTE ON FUNCTION public.create_relegation_playoff(uuid, uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.prepare_fixture_match(uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.resolve_relegation_playoff(uuid, integer, integer) FROM authenticated;

GRANT EXECUTE ON FUNCTION public.create_relegation_playoff(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.prepare_fixture_match(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.resolve_relegation_playoff(uuid, integer, integer) TO service_role;
