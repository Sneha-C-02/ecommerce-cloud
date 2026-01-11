import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom'
import { useAlert } from 'react-alert'
import { MdRocketLaunch } from "react-icons/md";
import { DataGrid } from '@mui/x-data-grid';
import Typography from "@mui/material/Typography";
import { clearError, getMyOrder } from '../../actions/orderAction'
import './MyOrder.css'


const MyOrder = () => {
  const alert = useAlert();
  const dispatch = useDispatch();
  const { loading, orders, error } = useSelector(state => state.myOrders);
  const { user } = useSelector(state => state.user);

  const rows = [];
  const columns = [
    { field: "id", headerName: "Order ID", minWidth: 300, flex: 1 },
    {
      field: "status",
      headerName: "Status",
      minWidth: 150,
      flex: 0.5,
      cellClassName: (params) => {
        if (params.row.status === "Delivered") return "greenColor";
        if (params.row.status === "Shipped") return "blueColor";
        return "redColor";
      }
    },
    { field: "itemQty", headerName: "Item Qty", minWidth: 150, type: "number", flex: 0.3 },
    { field: "amount", headerName: "Amount", minWidth: 270, type: "number", flex: 0.5 },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 50, type: "number",
      flex: 0.4, sortable: false,
      renderCell: (params) => {
        return (
          <Link to={`/order/${params.row.id}`}>
            <MdRocketLaunch />
          </Link>
        )
      }
    },
  ];

  // ✅ Helper to compute status dynamically (Professional Flow)
  const getStatus = (createdAt) => {
    const days = (new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24);
    if (days < 1) return "Ordered";
    if (days < 2) return "Processing";
    if (days < 4) return "Shipped";
    return "Delivered";
  };

  orders && orders.forEach((item, index) => {
    const dynamicStatus = getStatus(item.createdAt);
    rows.push({
      itemQty: item.OrderItems.length,
      id: item._id,
      status: dynamicStatus, // ✅ Use Computed Status
      amount: item.totalPrice
    })
  });

  useEffect(() => {
    if (error) {
      alert.error(error);
      dispatch(clearError());
    }
    dispatch(getMyOrder());
  }, [dispatch, alert, error])
  return (
    <>
      {/* { */}
      {/* loading */}
      {/* ? <Loader /> */}
      {/* :  */}
      <div className='my-order-page'>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={10}
          disableSelectionOnClick
          className='my-order-table'
          autoHeight
        />
        <Typography id='my-order-heading'>{user?.name || "User"}'s Orders</Typography>

      </div>
      {/* } */}
    </>
  )
}

export default MyOrder
