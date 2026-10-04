export const auth = async () => {
  return { user: { role: 'admin', email: 'admin@example.com' } };
};

export const getServerSession = auth;
