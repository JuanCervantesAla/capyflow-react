import ProfileContent from '../components/Profile/ProfileContent';
import { ProfileHeader } from '../components/Profile/ProfileHeader';


export const ProfilePage = () => {
  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: '#F5F1E8',
      overflow: 'hidden',
    }}>
      <ProfileHeader />
      <div style={{ 
        flex: 1, 
        overflow: 'auto',
        background: '#F5F1E8',
      }}>
        <ProfileContent />
      </div>
    </div>
  );
};
