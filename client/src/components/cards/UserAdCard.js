import { Badge } from "antd";
import { Link } from "react-router-dom";
import AdFeatures from "../../components/cards/AdFeatures";
import { formatNumber } from "../../helpers/ad";

export default function UserAdCard({ ad }) {
  return (
    <div className="col-lg-4 p-4 gx-4 gy-4">
      <Link to={`/user/ad/${ad.slug}`}>
        <Badge.Ribbon
          text={`${ad?.type} for ${ad?.action}`}
          color={`${ad?.action === "Sell" ? "blue" : "red"}`}
        >
          <div className="card hoverable shadow">
            {ad?.photos?.[0]?.Location ? (
              <img
                src={ad.photos[0].Location}
                alt={`${ad?.type}-${ad?.address}-${ad?.action}-${ad?.price}`}
                style={{ height: "250px", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  height: "250px",
                  backgroundColor: "#f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: "48px" }}>🏠</span>
              </div>
            )}

            <div className="card-body">
              <h3>${formatNumber(ad?.price)}</h3>
              <p className="card-text">{ad?.address}</p>

              <AdFeatures ad={ad} />
            </div>
          </div>
        </Badge.Ribbon>
      </Link>
    </div>
  );
}
