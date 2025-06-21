"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Info,
  DollarSign,
  Users,
  TrendingUp,
  Calendar,
  Trash2,
  BookMarkedIcon as MarkAsRead,
  Filter,
} from "lucide-react"

const notifications = [
  {
    id: 1,
    type: "payment",
    title: "Overdue Payment Alert",
    message: "Lagos Tech Hub payment of ₦12,000,000 is 10 days overdue",
    timestamp: "2024-01-26 14:30:00",
    read: false,
    priority: "high",
    category: "payments",
  },
  {
    id: 2,
    type: "exchange",
    title: "Exchange Rate Alert",
    message: "USD to NGN rate increased by 2.5% to ₦1,672",
    timestamp: "2024-01-26 13:45:00",
    read: false,
    priority: "medium",
    category: "rates",
  },
  {
    id: 3,
    type: "transaction",
    title: "Large Transaction Recorded",
    message: "New vendor purchase from Amazon: $8,000",
    timestamp: "2024-01-26 12:30:00",
    read: true,
    priority: "low",
    category: "transactions",
  },
  {
    id: 4,
    type: "report",
    title: "Monthly Report Generated",
    message: "January 2024 profit & loss report is ready for review",
    timestamp: "2024-01-26 09:15:00",
    read: true,
    priority: "low",
    category: "reports",
  },
  {
    id: 5,
    type: "user",
    title: "New User Registration",
    message: "New user 'John Doe' registered and awaiting approval",
    timestamp: "2024-01-25 16:20:00",
    read: false,
    priority: "medium",
    category: "users",
  },
  {
    id: 6,
    type: "security",
    title: "Security Alert",
    message: "Multiple failed login attempts detected from IP 192.168.1.100",
    timestamp: "2024-01-25 14:10:00",
    read: false,
    priority: "high",
    category: "security",
  },
]

const systemAlerts = [
  {
    id: 1,
    type: "maintenance",
    title: "Scheduled Maintenance",
    message: "System maintenance scheduled for Sunday, 2:00 AM - 4:00 AM",
    timestamp: "2024-01-26 10:00:00",
    status: "upcoming",
  },
  {
    id: 2,
    type: "update",
    title: "System Update Available",
    message: "Version 2.1.0 is available with new features and bug fixes",
    timestamp: "2024-01-25 18:30:00",
    status: "available",
  },
  {
    id: 3,
    type: "backup",
    title: "Backup Completed",
    message: "Daily backup completed successfully at 3:00 AM",
    timestamp: "2024-01-26 03:00:00",
    status: "completed",
  },
]

export default function Notifications() {
  const [activeTab, setActiveTab] = useState("all")
  const [notificationList, setNotificationList] = useState(notifications)
  const [selectedCategory, setSelectedCategory] = useState("all")

  const unreadCount = notificationList.filter((n) => !n.read).length
  const highPriorityCount = notificationList.filter((n) => n.priority === "high" && !n.read).length

  const getNotificationIcon = (type) => {
    switch (type) {
      case "payment":
        return <DollarSign className="h-5 w-5 text-red-600" />
      case "exchange":
        return <TrendingUp className="h-5 w-5 text-blue-600" />
      case "transaction":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "report":
        return <Info className="h-5 w-5 text-purple-600" />
      case "user":
        return <Users className="h-5 w-5 text-orange-600" />
      case "security":
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      default:
        return <Bell className="h-5 w-5 text-gray-600" />
    }
  }

  const getPriorityBadge = (priority) => {
    const colors = {
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800",
    }
    return colors[priority] || "bg-gray-100 text-gray-800"
  }

  const getSystemAlertIcon = (type) => {
    switch (type) {
      case "maintenance":
        return <Calendar className="h-5 w-5 text-orange-600" />
      case "update":
        return <TrendingUp className="h-5 w-5 text-blue-600" />
      case "backup":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      default:
        return <Info className="h-5 w-5 text-gray-600" />
    }
  }

  const markAsRead = (id) => {
    setNotificationList((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotificationList((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  const deleteNotification = (id) => {
    setNotificationList((prev) => prev.filter((notification) => notification.id !== id))
  }

  const filteredNotifications = notificationList.filter((notification) => {
    if (activeTab === "unread") return !notification.read
    if (activeTab === "high") return notification.priority === "high"
    if (selectedCategory !== "all") return notification.category === selectedCategory
    return true
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-2">Stay updated with your business activities and alerts</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={markAllAsRead}>
            <MarkAsRead className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Notification Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Notifications</p>
                <p className="text-2xl font-bold text-blue-600">{notificationList.length}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-orange-600">{unreadCount}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <Bell className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-red-600">{highPriorityCount}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Alerts</p>
                <p className="text-2xl font-bold text-purple-600">{systemAlerts.length}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Info className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Notifications</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
          <TabsTrigger value="high">High Priority</TabsTrigger>
          <TabsTrigger value="system">System Alerts</TabsTrigger>
        </TabsList>

        {/* All Notifications */}
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Notifications</CardTitle>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="text-sm border border-gray-300 rounded-md px-2 py-1"
                  >
                    <option value="all">All Categories</option>
                    <option value="payments">Payments</option>
                    <option value="rates">Exchange Rates</option>
                    <option value="transactions">Transactions</option>
                    <option value="reports">Reports</option>
                    <option value="users">Users</option>
                    <option value="security">Security</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start space-x-3 p-4 rounded-lg border transition-colors ${
                      notification.read ? "bg-gray-50 border-gray-200" : "bg-white border-blue-200 shadow-sm"
                    }`}
                  >
                    <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-sm font-medium ${notification.read ? "text-gray-700" : "text-gray-900"}`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityBadge(notification.priority)}>{notification.priority}</Badge>
                          {!notification.read && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
                        </div>
                      </div>
                      <p className={`text-sm mt-1 ${notification.read ? "text-gray-500" : "text-gray-600"}`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500">{new Date(notification.timestamp).toLocaleString()}</p>
                        <div className="flex items-center space-x-2">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              Mark as Read
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Unread Notifications */}
        <TabsContent value="unread">
          <Card>
            <CardHeader>
              <CardTitle>Unread Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notificationList
                  .filter((n) => !n.read)
                  .map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-start space-x-3 p-4 rounded-lg border border-blue-200 bg-white shadow-sm"
                    >
                      <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900">{notification.title}</h3>
                          <div className="flex items-center space-x-2">
                            <Badge className={getPriorityBadge(notification.priority)}>{notification.priority}</Badge>
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-500">{new Date(notification.timestamp).toLocaleString()}</p>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              Mark as Read
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* High Priority */}
        <TabsContent value="high">
          <Card>
            <CardHeader>
              <CardTitle>High Priority Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notificationList
                  .filter((n) => n.priority === "high")
                  .map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start space-x-3 p-4 rounded-lg border border-red-200 ${
                        notification.read ? "bg-red-50" : "bg-white shadow-sm"
                      }`}
                    >
                      <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3
                            className={`text-sm font-medium ${notification.read ? "text-gray-700" : "text-gray-900"}`}
                          >
                            {notification.title}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <Badge className="bg-red-100 text-red-800">HIGH</Badge>
                            {!notification.read && <div className="w-2 h-2 bg-red-600 rounded-full"></div>}
                          </div>
                        </div>
                        <p className={`text-sm mt-1 ${notification.read ? "text-gray-500" : "text-gray-600"}`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-500">{new Date(notification.timestamp).toLocaleString()}</p>
                          <div className="flex items-center space-x-2">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                Mark as Read
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Alerts */}
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start space-x-3 p-4 rounded-lg border border-purple-200 bg-purple-50"
                  >
                    <div className="flex-shrink-0 mt-1">{getSystemAlertIcon(alert.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900">{alert.title}</h3>
                        <Badge className="bg-purple-100 text-purple-800">{alert.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-2">{new Date(alert.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
