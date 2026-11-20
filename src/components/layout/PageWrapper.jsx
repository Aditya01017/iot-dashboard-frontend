import Sidebar from './Sidebar';
import '../../pages/dashboard.css';

const PageWrapper = ({ title, children }) => {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <div className="main-header">
          <h1 className="main-title">{title}</h1>
        </div>
        {children}
      </div>
    </div>
  );
};

export default PageWrapper;
