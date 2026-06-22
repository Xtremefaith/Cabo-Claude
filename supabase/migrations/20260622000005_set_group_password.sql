-- Let a confirmed member rotate the group's shared password.
--
-- Notes on the model (intentional):
--   * Membership is what grants access (group_members + RLS), NOT the password.
--     The password only gates *new* joins, so rotating it does NOT revoke any
--     device already in the group — it just changes what future invitees need.
--   * Any confirmed member may rotate it; the old password is not required (a
--     member who forgot it can still set a new one). This is the trust model for
--     a private friend group.
--   * The hash stays in group_secrets, which has no client RLS, so it remains
--     unreadable by clients — only this SECURITY DEFINER function can write it.

create or replace function public.set_group_password(p_group_id uuid, p_new_password text)
returns void
language plpgsql security definer
set search_path = public, extensions as $$
begin
  if not private.is_group_member(p_group_id) then
    raise exception 'not a member';
  end if;
  if length(coalesce(p_new_password, '')) < 4 then
    raise exception 'password must be at least 4 characters';
  end if;

  update public.group_secrets
     set password_hash = crypt(p_new_password, gen_salt('bf'))
   where group_id = p_group_id;
end;
$$;

grant execute on function public.set_group_password(uuid, text) to anon, authenticated;
